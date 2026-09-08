import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';
import ApiService from '../../core/services/ApiService';
import { AuthContext } from '../../core/hooks/context';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminManageLead = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const { userData: user } = useContext(AuthContext) || {};
    
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    const [statusForm, setStatusForm] = useState({
        status: '',
        status_message: '',
        admin_notes: ''
    });

    const [commissionForm, setCommissionForm] = useState({
        commission_amount: '',
        commission_status: 'pending'
    });

    useEffect(() => {
        fetchLeadDetails();
    }, [leadId]);

    const fetchLeadDetails = async () => {
        try {
            setLoading(true);
            const apiService = ApiService();
            const response = await apiService.vGet(`/api/credit-card-leads/${leadId}`, {});
            
            if (response.data.status === 1) {
                const leadData = response.data.data.lead;
                setLead(leadData);
                setStatusForm({
                    status: leadData.status,
                    status_message: leadData.status_message || '',
                    admin_notes: leadData.admin_notes || ''
                });
                setCommissionForm({
                    commission_amount: leadData.commission_amount || '',
                    commission_status: leadData.commission_status || 'pending'
                });
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
            const response = await apiService.vPut(`/api/admin/credit-card-leads/${leadId}/status`, statusForm);
            
            if (response.data.status === 1) {
                toast.success('Status updated successfully');
                fetchLeadDetails();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleNotesUpdate = async () => {
        try {
            setUpdating(true);
            const apiService = ApiService();
            const response = await apiService.vPut(`/api/admin/credit-card-leads/${leadId}/notes`, {
                admin_notes: statusForm.admin_notes,
                status_message: statusForm.status_message
            });
            
            if (response.data.status === 1) {
                toast.success('Notes updated successfully');
                fetchLeadDetails();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update notes');
        } finally {
            setUpdating(false);
        }
    };

    const handleCommissionSet = async (e) => {
        e.preventDefault();

        if (lead.status !== 'approved') {
            toast.warning('Commission can only be set for approved leads');
            return;
        }
        
        try {
            setUpdating(true);
            const apiService = ApiService();
            const response = await apiService.vPut(`/api/admin/credit-card-leads/${leadId}/commission`, commissionForm);
            
            if (response.data.status === 1) {
                toast.success('Commission set successfully');
                fetchLeadDetails();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to set commission');
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
            const response = await apiService.vPost(`/api/admin/credit-card-leads/${leadId}/release-commission`, {});
            
            if (response.data.status === 1) {
                toast.success('Commission released successfully');
                fetchLeadDetails();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to release commission');
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
            'approved': 'badge bg-success',
            'rejected': 'badge bg-danger',
            'cancelled': 'badge bg-dark'
        };
        return statusClasses[status] || 'badge bg-secondary';
    };

    const formatStatus = (status) => {
        return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <>
               
                <Pageheader mainheading="Manage Credit Card Lead" parentfolder="Credit Card" activepage="Manage" />
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

    if (error || !lead) {
        return (
            <>
                <Pageheader mainheading="Manage Credit Card Lead" parentfolder="Credit Card" activepage="Manage" />
                <div className="container-fluid mt-2">
                    <div className="alert alert-danger">{error || 'Lead not found'}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader mainheading="Manage Credit Card Lead" parentfolder="Credit Card" activepage="Manage" />

            <div className="container-fluid mt-2">
                <div className="row g-3">
                    {/* Lead Details */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-transparent">
                                <h5 className="card-title mb-0">Lead Details</h5>
                            </div>
                            <div className="card-body">
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <th width="40%">Lead ID:</th>
                                            <td><span className="badge bg-primary">{lead.lead_id}</span></td>
                                        </tr>
                                        <tr>
                                            <th>Full Name:</th>
                                            <td>{lead.full_name}</td>
                                        </tr>
                                        <tr>
                                            <th>Mobile:</th>
                                            <td>{lead.mobile}</td>
                                        </tr>
                                        <tr>
                                            <th>Email:</th>
                                            <td>{lead.email}</td>
                                        </tr>
                                        <tr>
                                            <th>Date of Birth:</th>
                                            <td>{new Date(lead.dob).toLocaleDateString()}</td>
                                        </tr>
                                        <tr>
                                            <th>PAN:</th>
                                            <td><code>{lead.pan}</code></td>
                                        </tr>
                                        <tr>
                                            <th>Monthly Income:</th>
                                            <td>₹{parseFloat(lead.monthly_income).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <th>Desired Card:</th>
                                            <td><span className="badge bg-info">{lead.desired_card}</span></td>
                                        </tr>
                                        <tr>
                                            <th>Lead Source:</th>
                                            <td>{lead.lead_source}</td>
                                        </tr>
                                        <tr>
                                            <th>Preferred Contact:</th>
                                            <td>{formatStatus(lead.preferred_contact_time)}</td>
                                        </tr>
                                        <tr>
                                            <th>Status:</th>
                                            <td><span className={getStatusBadgeClass(lead.status)}>{formatStatus(lead.status)}</span></td>
                                        </tr>
                                        <tr>
                                            <th>Created:</th>
                                            <td>{new Date(lead.created_at).toLocaleString()}</td>
                                        </tr>
                                        {lead.notes && (
                                            <tr>
                                                <th>User Notes:</th>
                                                <td className="text-muted">{lead.notes}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm mb-3">
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
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Status Message (Visible to User)</label>
                                        <input
                                            type="text"
                                            className="form-control"
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
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent">
                                <h5 className="card-title mb-0">Commission Management</h5>
                            </div>
                            <div className="card-body">
                                {lead.status === 'approved' ? (
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
                                            </select>
                                        </div>

                                        {lead.commission_amount && (
                                            <div className="alert alert-info mb-3">
                                                <strong>Current:</strong> ₹{lead.commission_amount} - {formatStatus(lead.commission_status)}
                                                {lead.commission_released_at && (
                                                    <div className="mt-1">
                                                        <small>Released on: {new Date(lead.commission_released_at).toLocaleString()}</small>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="d-flex gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={updating}
                                            >
                                                {updating ? 'Setting...' : 'Set Commission'}
                                            </button>
                                            
                                            {lead.commission_status === 'approved' && lead.commission_amount && (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={handleCommissionRelease}
                                                    disabled={updating || lead.commission_status === 'released'}
                                                >
                                                    {lead.commission_status === 'released' ? 'Already Released' : 'Release Commission'}
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                ) : (
                                    <div className="alert alert-warning mb-0">
                                        Commission can only be managed for approved leads.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    {lead.history && lead.history.length > 0 && (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-transparent">
                                    <h5 className="card-title mb-0">History</h5>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Old Status</th>
                                                    <th>New Status</th>
                                                    <th>Changed By</th>
                                                    <th>Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lead.history.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{new Date(item.created_at).toLocaleString()}</td>
                                                        <td>{item.old_status ? <span className={getStatusBadgeClass(item.old_status)}>{formatStatus(item.old_status)}</span> : '-'}</td>
                                                        <td><span className={getStatusBadgeClass(item.new_status)}>{formatStatus(item.new_status)}</span></td>
                                                        <td>{item.changed_by?.name || 'System'}</td>
                                                        <td className="text-muted">{item.remarks}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer 
                position="top-right" 
                autoClose={5000} 
                hideProgressBar={false} 
                newestOnTop={false} 
                closeOnClick 
                rtl={false} 
                pauseOnFocusLoss 
                draggable 
                pauseOnHover 
                theme="light" 
            />
        </>
    );
};

export default AdminManageLead;
