import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import { toast } from 'react-toastify';

const GstAdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updateForm, setUpdateForm] = useState({ status: '', message: '' });
    const [receiptFile, setReceiptFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const apiService = ApiService();
        try {
            const [statsRes, listRes] = await Promise.all([
                apiService.vGet('/api/online-service/gst/admin-dashboard'),
                apiService.vGet('/api/online-service/gst/admin/list')
            ]);

            if (statsRes.data.status === 1) setStats(statsRes.data.data);
            if (listRes.data.status === 1) setApplications(listRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleManage = (app) => {
        setSelectedApp(app);
        setUpdateForm({ status: app.status, message: app.message || '' });
        setReceiptFile(null);
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setProcessing(true);
        const apiService = ApiService();
        try {
            // Update Status
            const statusRes = await apiService.vPut(`/api/online-service/gst/${selectedApp.id}/status`, updateForm);

            // Upload Receipt if selected
            if (receiptFile) {
                // Check size just in case, though backend validates
                if (receiptFile.size > 200 * 1024) {
                    toast.warning('Receipt file too large (Max 200KB). Status updated but receipt might fail.');
                }
                const receiptRes = await apiService.postWithFile(`/api/online-service/gst/${selectedApp.id}/receipt`, {}, { aplication_reciept: receiptFile });
                if (receiptRes.data.status !== 1) toast.warning('Status updated but receipt upload failed: ' + receiptRes.data.message);
            }

            if (statusRes.data?.status === 1) {
                toast.success('Application updated successfully');
                setShowModal(false);
                fetchData();
            } else {
                toast.error(statusRes.data?.message || 'Failed to update status');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setProcessing(false);
        }
    };

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'pending': return <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3">Pending</span>;
            case 'approved': return <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">Approved</span>;
            case 'rejected': return <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3">Rejected</span>;
            case 'error': return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-3">Error</span>;
            default: return <span className="badge bg-light text-dark border">Unknown</span>;
        }
    };

    return (
        <>
            <Pageheader mainheading="GST Admin Dashboard" parentfolder="GST" activepage="Admin" />
            <div className="page-content-box">
                <div className="page-content-box-inner">

                    {/* Stats Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-primary text-white h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">Total Applications</h6>
                                    <h3 className="mb-0 fw-bold">{stats.total}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-warning text-dark h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">Pending</h6>
                                    <h3 className="mb-0 fw-bold">{stats.pending}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-success text-white h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">Approved</h6>
                                    <h3 className="mb-0 fw-bold">{stats.approved}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-danger text-white h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">Rejected</h6>
                                    <h3 className="mb-0 fw-bold">{stats.rejected}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold text-primary">All Applications</h5>
                        </div>
                        <div className="card-body p-0">
                            {loading ? <TableShimmerLoader /> : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="py-3 ps-4">SN</th>
                                                <th className="py-3">Date</th>
                                                <th className="py-3">User</th>
                                                <th className="py-3">Business Details</th>
                                                <th className="py-3">Status</th>
                                                <th className="py-3 text-end pe-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map((app, index) => (
                                                <tr key={app.id}>
                                                    <td className="ps-4 fw-medium text-secondary">{index + 1}</td>
                                                    <td className="text-secondary">{new Date(app.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="fw-medium text-dark">{app.user?.name || 'Unknown User'}</div>
                                                        <small className="text-muted">{app.user?.email}</small>
                                                    </td>
                                                    <td>
                                                        <div className="fw-medium text-dark">{app.bussiness_name}</div>
                                                        <small className="text-muted d-block">{app.bussiness_owner_name}</small>
                                                        <small className="text-muted d-block">{app.mobile_number}</small>
                                                        <small className="text-muted">{app.email_id}</small>
                                                    </td>
                                                    <td><StatusBadge status={app.status} /></td>
                                                    <td className="text-end pe-4">
                                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleManage(app)}>
                                                            <i className="fa fa-cog me-1"></i> Manage
                                                        </button>
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

            {/* Manage Modal */}
            {showModal && selectedApp && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Manage Application #{selectedApp.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-secondary text-uppercase fs-7 mb-3">Application Details</h6>
                                        <dl className="row mb-0">
                                            <dt className="col-sm-5 text-secondary fw-normal">Business Name</dt>
                                            <dd className="col-sm-7 fw-medium">{selectedApp.bussiness_name}</dd>

                                            <dt className="col-sm-5 text-secondary fw-normal">Owner Name</dt>
                                            <dd className="col-sm-7 fw-medium">{selectedApp.bussiness_owner_name}</dd>

                                            <dt className="col-sm-5 text-secondary fw-normal">Mobile</dt>
                                            <dd className="col-sm-7">{selectedApp.mobile_number}</dd>

                                            <dt className="col-sm-5 text-secondary fw-normal">Email</dt>
                                            <dd className="col-sm-7">{selectedApp.email_id}</dd>

                                            <dt className="col-sm-5 text-secondary fw-normal">PAN No.</dt>
                                            <dd className="col-sm-7">{selectedApp.pancard_number}</dd>

                                            <dt className="col-sm-5 text-secondary fw-normal">Aadhar No.</dt>
                                            <dd className="col-sm-7">{selectedApp.aadharcard_number}</dd>

                                            <dt className="col-sm-5 text-secondary fw-normal">Address Type</dt>
                                            <dd className="col-sm-7">{selectedApp.bussiness_address_type_name}</dd>
                                        </dl>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-secondary text-uppercase fs-7 mb-3">Documents</h6>
                                        <div className="d-flex flex-column gap-2">
                                            <a href={`${selectedApp.pancard_file}`} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm text-start border"><i className="fa fa-file me-2 text-secondary"></i> Pan Card</a>
                                            <a href={`${selectedApp.aadharcard_front}`} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm text-start border"><i className="fa fa-file me-2 text-secondary"></i> Aadhar Front</a>
                                            <a href={`${selectedApp.aadharcard_back}`} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm text-start border"><i className="fa fa-file me-2 text-secondary"></i> Aadhar Back</a>
                                            <a href={`${selectedApp.bussiness_address_file}`} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm text-start border"><i className="fa fa-file me-2 text-secondary"></i> Business Address</a>
                                            <a href={`${selectedApp.shop_banner}`} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm text-start border"><i className="fa fa-image me-2 text-secondary"></i> Shop Banner</a>
                                            {selectedApp.aplication_reciept && (
                                                <a href={`${selectedApp.aplication_reciept}`} target="_blank" rel="noopener noreferrer" className="btn btn-success-subtle btn-sm text-start border border-success-subtle text-success fw-bold"><i className="fa fa-check-circle me-2"></i> Current Receipt</a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <hr className="my-1 text-secondary opacity-25" />
                                    </div>
                                    {selectedApp.status === 'pending' && (
                                        <div className="col-12">
                                            <h6 className="fw-bold text-secondary text-uppercase fs-7 mb-3">Update Status & Action</h6>
                                            <form onSubmit={handleUpdate}>
                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label">Status</label>
                                                        <select className="form-select" value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} required>
                                                            <option value="pending">Pending</option>
                                                            <option value="approved">Approved</option>
                                                            <option value="rejected">Rejected</option>
                                                            <option value="error">Error</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-8">
                                                        <label className="form-label">Upload Receipt (For Approved)</label>
                                                        <input type="file" className="form-control" onChange={(e) => setReceiptFile(e.target.files[0])} accept="image/*,.pdf" />
                                                        <small className="text-muted">Max 200KB</small>
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Message / Remark</label>
                                                        <textarea className="form-control" rows="3" value={updateForm.message} onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })} placeholder="Enter message for user (reason for rejection, instruction, etc.)"></textarea>
                                                    </div>
                                                </div>
                                                <div className="mt-4 text-end">
                                                    <button type="button" className="btn btn-light me-2 border" onClick={() => setShowModal(false)}>Close</button>
                                                    <button type="submit" className="btn btn-primary px-4" disabled={processing}>
                                                        {processing ? 'Updating...' : 'Save Changes'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GstAdminDashboard;
