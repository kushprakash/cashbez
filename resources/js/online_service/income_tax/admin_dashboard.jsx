import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import { toast } from 'react-toastify';

const IncomeTaxAdminDashboard = () => {
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
                apiService.vGet('/api/online-service/income-tax/admin-dashboard'),
                apiService.vGet('/api/online-service/income-tax/admin/list')
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
            const statusRes = await apiService.vPut(`/api/online-service/income-tax/${selectedApp.id}/status`, updateForm);

            // Upload Receipt if selected
            if (receiptFile) {
                if (receiptFile.size > 2048 * 1024) { // 2MB
                    toast.warning('Receipt file too large. Status updated but receipt might fail.');
                }
                const receiptRes = await apiService.postWithFile(`/api/online-service/income-tax/${selectedApp.id}/receipt`, {}, { application_reciept: receiptFile });
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

    const InfoRow = ({ label, value }) => (
        <>
            <dt className="col-sm-5 text-secondary fw-normal mb-1">{label}</dt>
            <dd className="col-sm-7 fw-medium mb-1 text-dark">{value || '-'}</dd>
        </>
    );

    const DocLink = ({ file, label, icon = 'fa-file' }) => {
        if (!file) return null;
        return (
            <a href={`${file}`} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm text-start border w-100 mb-2">
                <i className={`fa ${icon} me-2 text-secondary`}></i> {label}
            </a>
        );
    };

    return (
        <>
            <Pageheader mainheading="Income Tax Admin" parentfolder="Income Tax" activepage="Admin" />
            <div className="page-content-box">
                <div className="page-content-box-inner">

                    {/* Stats Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-primary text-white h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">Total</h6>
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
                                                <th className="py-3">Applicant Details</th>
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
                                                        <div className="fw-medium text-dark">{app.user?.name || 'Unknown'}</div>
                                                        <small className="text-muted">{app.user?.email}</small>
                                                    </td>
                                                    <td>
                                                        <div className="fw-medium text-dark">{app.bussiness_name || 'Individual'}</div>
                                                        <span className="badge bg-light text-dark border me-2">{app.application_type}</span>
                                                        <small className="text-muted">PAN: {app.pan_number}</small>
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
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Manage Application #{selectedApp.id} ({selectedApp.application_type})</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-4 border-end">
                                        <h6 className="fw-bold text-secondary text-uppercase fs-7 mb-3">Basic Details</h6>
                                        <dl className="row mb-0">
                                            <InfoRow label="Type" value={selectedApp.application_type} />
                                            <InfoRow label="Mobile" value={selectedApp.mobile_number} />
                                            <InfoRow label="Email" value={selectedApp.email_id} />
                                            <InfoRow label="PAN" value={selectedApp.pan_number} />
                                            <InfoRow label="Aadhar" value={selectedApp.aadhar_number} />
                                            <InfoRow label="ITR Password" value={selectedApp.itr_password} />
                                        </dl>
                                        <hr className="my-3 text-muted opacity-25" />
                                        <h6 className="fw-bold text-secondary text-uppercase fs-7 mb-3">Bank Details</h6>
                                        <dl className="row mb-0">
                                            <InfoRow label="Account No" value={selectedApp.bank_account_no} />
                                            <InfoRow label="IFSC" value={selectedApp.ifsc_code} />
                                            <InfoRow label="Type" value={selectedApp.account_type} />
                                        </dl>
                                    </div>

                                    <div className="col-md-4 border-end">
                                        <h6 className="fw-bold text-secondary text-uppercase fs-7 mb-3">Business / Deductions</h6>
                                        {selectedApp.application_type === 'business' && (
                                            <div className="mb-3 bg-light p-3 rounded">
                                                <dl className="row mb-0">
                                                    <InfoRow label="Business Name" value={selectedApp.bussiness_name} />
                                                    <InfoRow label="Nature" value={selectedApp.nature_of_business} />
                                                    <InfoRow label="Sales" value={selectedApp.total_sales} />
                                                    <InfoRow label="Margin" value={selectedApp.profit_margin} />
                                                    <InfoRow label="Expenses" value={selectedApp.business_expenses} />
                                                </dl>
                                            </div>
                                        )}
                                        <dl className="row mb-0">
                                            <dt className="col-12 text-secondary fw-bold mb-2 small">Deductions Claimed</dt>
                                            <InfoRow label="LIC/Tuition" value={selectedApp.deduction_lic_tuition} />
                                            <InfoRow label="FD/NSC" value={selectedApp.deduction_fd_nsc} />
                                            <InfoRow label="Home Loan" value={selectedApp.deduction_home_loan} />
                                            <InfoRow label="Health Ins." value={selectedApp.deduction_health_insurance} />
                                            <InfoRow label="Savings Int." value={selectedApp.deduction_savings_interest} />
                                        </dl>
                                    </div>

                                    <div className="col-md-4">
                                        <h6 className="fw-bold text-secondary text-uppercase fs-7 mb-3">Documents</h6>
                                        <div className="d-flex flex-column gap-1">
                                            <DocLink file={selectedApp.pan_file} label="PAN Card" />
                                            <DocLink file={selectedApp.aadhar_front_file} label="Aadhar Front" />
                                            <DocLink file={selectedApp.aadhar_back_file} label="Aadhar Back" />
                                            <DocLink file={selectedApp.id_proof_file} label="ID Proof" />
                                            <DocLink file={selectedApp.bank_statement_file} label="Bank Statement" />
                                            <DocLink file={selectedApp.form_16_file} label="Form 16 / Salary Slip" />

                                            {selectedApp.application_reciept && (
                                                <a href={`${selectedApp.application_reciept}`} target="_blank" rel="noopener noreferrer" className="btn btn-success-subtle btn-sm text-start border border-success-subtle text-success fw-bold mt-2"><i className="fa fa-check-circle me-2"></i> Current Receipt</a>
                                            )}
                                        </div>
                                    </div>

                                    {updateForm.status === 'pending' && (
                                        <div className="col-12 mt-4 pt-4 border-top">
                                            <h6 className="fw-bold text-secondary text-uppercase fs-7 mb-3">Action & Update</h6>
                                            <form onSubmit={handleUpdate}>
                                                <div className="row g-3">
                                                    <div className="col-md-3">
                                                        <label className="form-label">Status</label>
                                                        <select className="form-select" value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} required>
                                                            <option value="pending">Pending</option>
                                                            <option value="approved">Approved</option>
                                                            <option value="rejected">Rejected</option>
                                                            <option value="error">Error</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">Upload Receipt (For Approved)</label>
                                                        <input type="file" className="form-control" onChange={(e) => setReceiptFile(e.target.files[0])} accept="image/*,.pdf" />
                                                    </div>
                                                    <div className="col-md-5">
                                                        <label className="form-label">Message</label>
                                                        <input type="text" className="form-control" value={updateForm.message} onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })} placeholder="Comments for user..." />
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-end">
                                                    <button type="button" className="btn btn-light me-2 border" onClick={() => setShowModal(false)}>Close</button>
                                                    <button type="submit" className="btn btn-primary px-4" disabled={processing}>
                                                        {processing ? 'Updating...' : 'Save & Update'}
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

export default IncomeTaxAdminDashboard;
