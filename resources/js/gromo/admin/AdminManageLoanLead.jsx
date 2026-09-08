import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { AuthContext } from '../../core/hooks/context';
import { notify, Toast } from '../../core/messages/Toast';
import Pageheader from '../../layouts/Pageheader';

const AdminManageLoanLead = () => {
    const { leadId } = useParams();
    const { userData: user } = useContext(AuthContext) || {};
    const [lead, setLead] = useState(null);
    const [assignees, setAssignees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    const [statusForm, setStatusForm] = useState({
        status: '',
        status_message: '',
        admin_notes: ''
    });

    const [assignForm, setAssignForm] = useState({
        assigned_to: '',
        remarks: ''
    });

    const [commissionForm, setCommissionForm] = useState({
        commission_amount: '',
        commission_status: 'pending',
        remarks: ''
    });

    useEffect(() => {
        fetchLeadDetails();
    }, [leadId]);

    useEffect(() => {
        if (lead) {
            setStatusForm({
                status: lead.status,
                status_message: lead.status_message || '',
                admin_notes: lead.admin_notes || ''
            });
            setAssignForm({
                assigned_to: lead.assigned_to || '',
                remarks: ''
            });
            setCommissionForm({
                commission_amount: lead.commission_amount || '',
                commission_status: lead.commission_status || 'pending',
                remarks: ''
            });
        }
    }, [lead]);

    const fetchLeadDetails = async () => {
        try {
            setLoading(true);
            const apiService = ApiService();
            const response = await apiService.vGet(`/api/admin/loan-leads/${leadId}`);
            
            if (response.data.status === 1) {
                setLead(response.data.data.lead);
                setAssignees(response.data.data.assignees || []);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to load lead details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const apiService = ApiService();
            const response = await apiService.vPut(`/api/admin/loan-leads/${leadId}/status`, statusForm);
            
            if (response.data.status === 1) {
                notify.success('Status updated successfully');
                fetchLeadDetails();
            } else {
                notify.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            notify.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleNotesUpdate = async () => {
        try {
            setUpdating(true);
            const apiService = ApiService();
            const response = await apiService.vPut(`/api/admin/loan-leads/${leadId}/notes`, {
                admin_notes: statusForm.admin_notes,
                status_message: statusForm.status_message
            });
            
            if (response.data.status === 1) {
                notify.success('Notes updated successfully');
                fetchLeadDetails();
            } else {
                notify.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            notify.error('Failed to update notes');
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignLead = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const apiService = ApiService();
            const response = await apiService.vPut(`/api/admin/loan-leads/${leadId}/assign`, assignForm);
            
            if (response.data.status === 1) {
                notify.success('Lead assigned successfully');
                fetchLeadDetails();
                setAssignForm({...assignForm, remarks: ''});
            } else {
                notify.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            notify.error('Failed to assign lead');
        } finally {
            setUpdating(false);
        }
    };

    const handleCommissionSet = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const apiService = ApiService();
            const response = await apiService.vPut(`/api/admin/loan-leads/${leadId}/commission`, commissionForm);
            
            if (response.data.status === 1) {
                notify.success('Commission set successfully');
                fetchLeadDetails();
            } else {
                notify.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            notify.error('Failed to set commission');
        } finally {
            setUpdating(false);
        }
    };

    const handleCommissionRelease = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to release commission of ₹${lead.commission_amount}?`
        );

        if (!confirmed) return;
        
        try {
            setUpdating(true);
            const apiService = ApiService();
            const response = await apiService.vPost(`/api/admin/loan-leads/${leadId}/release-commission`, {});
            
            if (response.data.status === 1) {
                notify.success('Commission released successfully');
                fetchLeadDetails();
            } else {
                notify.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            notify.error('Failed to release commission');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'new': 'badge bg-primary',
            'contacted': 'badge bg-info',
            'document_pending': 'badge bg-warning',
            'under_review': 'badge bg-secondary',
            'processing': 'badge bg-info',
            'approved': 'badge bg-success',
            'disbursed': 'badge bg-success',
            'rejected': 'badge bg-danger',
            'cancelled': 'badge bg-dark'
        };
        return statusClasses[status] || 'badge bg-secondary';
    };

    const formatStatus = (status) => {
        if (!status) return 'N/A';
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getLoanTypeBadge = (loanType) => {
        return loanType === 'business' ? 
            <span className="badge bg-warning">Business Loan</span> : 
            <span className="badge bg-info">Personal Loan</span>;
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Loan Leads" parentfolder="Loan" activepage="Dashboard" />
                <div className="container-fluid mt-2">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Pageheader mainheading="Manage Loan Leads" parentfolder="Loan" activepage="Dashboard" />
                <div className="container-fluid mt-4">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader mainheading="Loan Leads" parentfolder="Loan" activepage="Dashboard" />
            <div className="container-fluid mt-2">
                {/* Navigation */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        <i className="ti ti-edit me-2 text-primary"></i>
                                        Quick Actions
                                    </h5>
                                    <div className="d-flex gap-2">
                                        <Link to="/loan-leads/dashboard" className="btn btn-outline-info btn-sm">
                                            <i className="ti ti-dashboard me-1"></i> Loan Dashboard
                                        </Link>
                                        <Link to="/loan-leads/list" className="btn btn-outline-primary btn-sm">
                                            <i className="ti ti-list me-1"></i> All Leads
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Lead Details */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        Lead Details - {lead.lead_id}
                                    </h5>
                                    <div className="d-flex gap-2">
                                        {getLoanTypeBadge(lead.loan_type)}
                                        <span className={getStatusBadgeClass(lead.status)}>
                                            {formatStatus(lead.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-muted">Customer Information</h6>
                                        <table className="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Full Name:</strong></td>
                                                    <td>{lead.full_name}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Mobile:</strong></td>
                                                    <td>{lead.mobile}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Email:</strong></td>
                                                    <td className="text-break">{lead.email}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Date of Birth:</strong></td>
                                                    <td>{lead.dob ? new Date(lead.dob).toLocaleDateString() : 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>PAN:</strong></td>
                                                    <td>{lead.pan}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="col-md-6">
                                        <h6 className="text-muted">Loan Information</h6>
                                        <table className="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Loan Type:</strong></td>
                                                    <td>{formatStatus(lead.loan_type)}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Loan Amount:</strong></td>
                                                    <td className="fw-bold text-success">{formatCurrency(lead.loan_amount)}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Loan Tenure:</strong></td>
                                                    <td>{lead.loan_tenure} months</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Loan Purpose:</strong></td>
                                                    <td>{lead.loan_purpose ? formatStatus(lead.loan_purpose) : 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Applied Date:</strong></td>
                                                    <td>{new Date(lead.created_at).toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Business/Personal Specific Info */}
                                {lead.loan_type === 'business' ? (
                                    <div className="row mt-3">
                                        <div className="col-12">
                                            <h6 className="text-muted">Business Information</h6>
                                            <table className="table table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td><strong>Business Name:</strong></td>
                                                        <td>{lead.business_name || 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Business Type:</strong></td>
                                                        <td>{lead.business_type ? formatStatus(lead.business_type) : 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>GST Number:</strong></td>
                                                        <td>{lead.gst_number || 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Annual Turnover:</strong></td>
                                                        <td>{lead.annual_turnover ? formatCurrency(lead.annual_turnover) : 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Business Vintage:</strong></td>
                                                        <td>{lead.business_vintage_years ? `${lead.business_vintage_years} years` : 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="row mt-3">
                                        <div className="col-12">
                                            <h6 className="text-muted">Employment Information</h6>
                                            <table className="table table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td><strong>Employment Type:</strong></td>
                                                        <td>{lead.employment_type ? formatStatus(lead.employment_type) : 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Company Name:</strong></td>
                                                        <td>{lead.company_name || 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Monthly Income:</strong></td>
                                                        <td>{lead.monthly_income ? formatCurrency(lead.monthly_income) : 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Work Experience:</strong></td>
                                                        <td>{lead.work_experience_years ? `${lead.work_experience_years} years` : 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Address Information */}
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <h6 className="text-muted">Address Information</h6>
                                        <table className="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Address:</strong></td>
                                                    <td>{lead.address || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>City:</strong></td>
                                                    <td>{lead.city || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>State:</strong></td>
                                                    <td>{lead.state || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Pincode:</strong></td>
                                                    <td>{lead.pincode || 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Applied By Information */}
                                {lead.user && (
                                    <div className="row mt-3">
                                        <div className="col-12">
                                            <h6 className="text-muted">Applied By</h6>
                                            <table className="table table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td><strong>Name:</strong></td>
                                                        <td>{lead.user.name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Mobile:</strong></td>
                                                        <td>{lead.user.mobile}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Email:</strong></td>
                                                        <td>{lead.user.email}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Messages */}
                        {(lead.status_message || lead.admin_notes) && (
                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-header bg-transparent">
                                    <h5 className="card-title mb-0">Notes & Messages</h5>
                                </div>
                                <div className="card-body">
                                    {lead.status_message && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Customer Message:</label>
                                            <div className="alert alert-info">{lead.status_message}</div>
                                        </div>
                                    )}
                                    {lead.admin_notes && (
                                        <div>
                                            <label className="form-label fw-bold">Admin Notes:</label>
                                            <div className="alert alert-warning">{lead.admin_notes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* History */}
                        {lead.history && lead.history.length > 0 && (
                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-header bg-transparent">
                                    <h5 className="card-title mb-0">Action History</h5>
                                </div>
                                <div className="card-body">
                                    <div className="timeline">
                                        {lead.history.map((entry, index) => (
                                            <div key={entry.id} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="d-flex justify-content-between">
                                                        <strong>{entry.remarks}</strong>
                                                        <small className="text-muted">
                                                            {new Date(entry.created_at).toLocaleString()}
                                                        </small>
                                                    </div>
                                                    <div className="text-muted">
                                                        By: {entry.changed_by?.name || 'System'}
                                                        {entry.old_status !== entry.new_status && (
                                                            <span> | Status: {formatStatus(entry.old_status)} → {formatStatus(entry.new_status)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions Sidebar */}
                    <div className="col-lg-4">
                        {/* Status Update */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent">
                                <h5 className="card-title mb-0">Update Status</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleStatusUpdate}>
                                    <div className="mb-3">
                                        <label className="form-label">Status <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={statusForm.status}
                                            onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
                                            required
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="document_pending">Document Pending</option>
                                            <option value="under_review">Under Review</option>
                                            <option value="processing">Processing</option>
                                            <option value="approved">Approved</option>
                                            <option value="disbursed">Disbursed</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Customer Message</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={statusForm.status_message}
                                            onChange={(e) => setStatusForm({...statusForm, status_message: e.target.value})}
                                            placeholder="e.g., Your application is under review"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Admin Notes (Internal Only)</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={statusForm.admin_notes}
                                            onChange={(e) => setStatusForm({...statusForm, admin_notes: e.target.value})}
                                            placeholder="Internal notes..."
                                        ></textarea>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={updating}
                                        >
                                            {updating ? 'Updating...' : 'Update Status'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleNotesUpdate}
                                            disabled={updating}
                                        >
                                            Update Notes Only
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Commission Management */}
                        <div className="card border-0 shadow-sm mt-4">
                            <div className="card-header bg-transparent">
                                <h5 className="card-title mb-0">Commission Management</h5>
                            </div>
                            <div className="card-body">
                                {lead.status === 'disbursed' ? (
                                    <form onSubmit={handleCommissionSet}>
                                        <div className="mb-3">
                                            <label className="form-label">Commission Amount (₹) <span className="text-danger">*</span></label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={commissionForm.commission_amount}
                                                onChange={(e) => setCommissionForm({...commissionForm, commission_amount: e.target.value})}
                                                placeholder="1000"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Commission Status <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select"
                                                value={commissionForm.commission_status}
                                                onChange={(e) => setCommissionForm({...commissionForm, commission_status: e.target.value})}
                                                required
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Remarks</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={commissionForm.remarks}
                                                onChange={(e) => setCommissionForm({...commissionForm, remarks: e.target.value})}
                                                placeholder="Commission remarks..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-success w-100"
                                            disabled={updating}
                                        >
                                            {updating ? 'Setting...' : 'Set Commission'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="alert alert-info">
                                        Commission can only be set after loan disbursement.
                                        Current status: <strong>{formatStatus(lead.status)}</strong>
                                    </div>
                                )}

                                {/* Release Commission Button */}
                                {lead.commission_amount && lead.commission_status === 'approved' && lead.status === 'disbursed' && (
                                    <div className="mt-3">
                                        <hr />
                                        <div className="text-center">
                                            <h6>Current Commission: ₹{lead.commission_amount}</h6>
                                            <button
                                                className="btn btn-success"
                                                onClick={handleCommissionRelease}
                                                disabled={updating}
                                            >
                                                <i className="ti ti-check me-1"></i>
                                                {updating ? 'Releasing...' : 'Release Commission'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Commission Status Display */}
                                {lead.commission_amount && (
                                    <div className="mt-3">
                                        <hr />
                                        <div className="text-center">
                                            <h6>Commission Status</h6>
                                            <div className="mb-2">
                                                <strong>Amount:</strong> ₹{lead.commission_amount}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Status:</strong> 
                                                <span className={`badge ms-1 ${
                                                    lead.commission_status === 'released' ? 'bg-success' :
                                                    lead.commission_status === 'approved' ? 'bg-info' :
                                                    lead.commission_status === 'pending' ? 'bg-warning' : 'bg-danger'
                                                }`}>
                                                    {formatStatus(lead.commission_status)}
                                                </span>
                                            </div>
                                            {lead.commission_released_at && (
                                                <div>
                                                    <small className="text-muted">
                                                        Released: {new Date(lead.commission_released_at).toLocaleString()}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assignment */}
                        {assignees.length > 0 && (
                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-header bg-transparent">
                                    <h5 className="card-title mb-0">Assign Lead</h5>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleAssignLead}>
                                        <div className="mb-3">
                                            <label className="form-label">Assign To <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select"
                                                value={assignForm.assigned_to}
                                                onChange={(e) => setAssignForm({...assignForm, assigned_to: e.target.value})}
                                                required
                                            >
                                                <option value="">Select assignee...</option>
                                                {assignees.map(assignee => (
                                                    <option key={assignee.id} value={assignee.id}>
                                                        {assignee.name} ({assignee.role === 1 ? 'SuperAdmin' : 'Admin'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Assignment Remarks</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={assignForm.remarks}
                                                onChange={(e) => setAssignForm({...assignForm, remarks: e.target.value})}
                                                placeholder="Assignment remarks..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={updating}
                                        >
                                            {updating ? 'Assigning...' : 'Assign Lead'}
                                        </button>
                                    </form>

                                    {lead.assigned_to && (
                                        <div className="mt-3 text-center">
                                            <small className="text-muted">
                                                Currently assigned to: <strong>{lead.assigned_to.name}</strong>
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .timeline {
                    position: relative;
                    padding-left: 30px;
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 20px;
                }

                .timeline-marker {
                    position: absolute;
                    left: -35px;
                    top: 5px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background-color: #007bff;
                    border: 2px solid #fff;
                    box-shadow: 0 0 0 2px #007bff;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    left: -31px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background-color: #e9ecef;
                }

                .timeline-content {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 3px solid #007bff;
                }
            `}</style>
            <Toast />
        </>
    );
};

export default AdminManageLoanLead;