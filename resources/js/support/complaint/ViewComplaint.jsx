import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';
import Pageheader from '../../layouts/Pageheader';

const ViewComplaint = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Modal states
    const [statusModal, setStatusModal] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [commentModal, setCommentModal] = useState(false);
    
    // Form states
    const [statusForm, setStatusForm] = useState({ status: '', remarks: '' });
    const [assignForm, setAssignForm] = useState({ assigned_to: '', remarks: '' });
    const [commentForm, setCommentForm] = useState({ comment_text: '', is_internal: false });
    
    // Data states
    const [assignees, setAssignees] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchComplaint();
        fetchCurrentUser();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            setLoading(true);
            const response = await complaintService.getComplaint(id);
            if (response.status === 1) {
                setComplaint(response.data);
            } else {
                alert(response.message || 'Error fetching complaint');
                navigate('/complaints/list');
            }
        } catch (error) {
            console.error('Error fetching complaint:', error);
            alert('Error loading complaint');
            navigate('/complaints/list');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        // Assume current user is stored in localStorage or context
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(user);
    };

    const fetchAssignees = async () => {
        try {
            const response = await complaintService.getComplaints({ per_page: 1 });
            if (response.status === 1 && response.assignees) {
                setAssignees(response.assignees);
            }
        } catch (error) {
            console.error('Error fetching assignees:', error);
        }
    };

    const handleStatusUpdate = async () => {
        if (!statusForm.status) {
            alert('Please select a status');
            return;
        }

        try {
            setActionLoading(true);
            const response = await complaintService.updateStatus(
                complaint.complaint_id,
                statusForm.status,
                statusForm.remarks
            );

            if (response.status === 1) {
                alert('Status updated successfully');
                setStatusModal(false);
                setStatusForm({ status: '', remarks: '' });
                fetchComplaint();
            } else {
                alert(response.message || 'Error updating status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!assignForm.assigned_to) {
            alert('Please select an assignee');
            return;
        }

        try {
            setActionLoading(true);
            const response = await complaintService.assignComplaint(
                complaint.complaint_id,
                assignForm.assigned_to,
                assignForm.remarks
            );

            if (response.status === 1) {
                alert('Complaint assigned successfully');
                setAssignModal(false);
                setAssignForm({ assigned_to: '', remarks: '' });
                fetchComplaint();
            } else {
                alert(response.message || 'Error assigning complaint');
            }
        } catch (error) {
            console.error('Error assigning complaint:', error);
            alert('Error assigning complaint');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!commentForm.comment_text.trim()) {
            alert('Please enter a comment');
            return;
        }

        try {
            setActionLoading(true);
            const response = await complaintService.addComment(
                complaint.complaint_id,
                commentForm.comment_text,
                commentForm.is_internal
            );

            if (response.status === 1) {
                alert('Comment added successfully');
                setCommentModal(false);
                setCommentForm({ comment_text: '', is_internal: false });
                fetchComplaint();
            } else {
                alert(response.message || 'Error adding comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Error adding comment');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const badges = {
            'NEW': 'badge bg-info',
            'ACKNOWLEDGED': 'badge bg-primary',
            'IN_PROGRESS': 'badge bg-warning text-dark',
            'RESOLVED': 'badge bg-success',
            'CLOSED': 'badge bg-secondary',
            'REOPENED': 'badge bg-danger'
        };
        return badges[status] || 'badge bg-secondary';
    };

    const getPriorityBadgeClass = (priority) => {
        const badges = {
            'LOW': 'badge bg-secondary',
            'MEDIUM': 'badge bg-info',
            'HIGH': 'badge bg-warning text-dark',
            'URGENT': 'badge bg-danger'
        };
        return badges[priority] || 'badge bg-secondary';
    };

    const getCategoryBadgeClass = (category) => {
        const badges = {
            'TRANSACTION': 'badge bg-primary',
            'ACCOUNT': 'badge bg-success',
            'TECHNICAL': 'badge bg-info',
            'BILLING': 'badge bg-warning text-dark',
            'KYC': 'badge bg-danger',
            'OTHER': 'badge bg-secondary'
        };
        return badges[category] || 'badge bg-secondary';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const canEdit = () => {
        if (!complaint || !currentUser) return false;
        return complaint.permissions?.can_edit || false;
    };

    const canAssign = () => {
        if (!complaint || !currentUser) return false;
        return complaint.permissions?.can_assign || false;
    };

    const canResolve = () => {
        if (!complaint || !currentUser) return false;
        return complaint.permissions?.can_resolve || false;
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="View Complaint" />
                <div className="page-content-box">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!complaint) {
        return null;
    }

    return (
        <>
            <Pageheader 
                mainheading={`Complaint #${complaint.complaint_id}`}
                parentfolder="Complaints"
                activepage="View Details"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        {/* Left Column - Main Details */}
                        <div className="col-lg-8">
                            {/* Complaint Info Card */}
                            <div className="card mb-4 border-0 shadow-sm">
                                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="fas fa-info-circle me-2 text-primary"></i>
                                        Complaint Details
                                    </h5>
                                    <div className="d-flex gap-2">
                                        <span className={getStatusBadgeClass(complaint.status)}>
                                            {complaint.status}
                                        </span>
                                        <span className={getPriorityBadgeClass(complaint.priority)}>
                                            {complaint.priority}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="text-muted small">Title</label>
                                        <h5 className="mb-0">{complaint.title}</h5>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted small">Description</label>
                                        <p className="mb-0">{complaint.description}</p>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="text-muted small">Category</label>
                                            <p className="mb-0">
                                                <span className={getCategoryBadgeClass(complaint.category)}>
                                                    {complaint.category}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small">Created On</label>
                                            <p className="mb-0">
                                                <i className="fas fa-calendar me-2"></i>
                                                {formatDate(complaint.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Card */}
                            {complaint.attachments && complaint.attachments.length > 0 && (
                                <div className="card mb-4 border-0 shadow-sm">
                                    <div className="card-header bg-white border-0">
                                        <h5 className="mb-0 fw-bold">
                                            <i className="fas fa-paperclip me-2 text-primary"></i>
                                            Attachments ({complaint.attachments.length})
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-2">
                                            {complaint.attachments.map((attachment, index) => (
                                                <div key={index} className="col-md-6">
                                                    <div className="card border">
                                                        <div className="card-body p-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="flex-shrink-0">
                                                                    <i className="fas fa-file fa-2x text-primary"></i>
                                                                </div>
                                                                <div className="flex-grow-1 ms-3">
                                                                    <h6 className="mb-0 text-truncate">{attachment.file_name}</h6>
                                                                    <small className="text-muted">{attachment.file_size || 'N/A'}</small>
                                                                </div>
                                                                <a
                                                                    href={attachment.file_path}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                >
                                                                    <i className="fas fa-download"></i>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Comments Section */}
                            <div className="card mb-4 border-0 shadow-sm">
                                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="fas fa-comments me-2 text-primary"></i>
                                        Comments ({complaint.comments?.length || 0})
                                    </h5>
                                    {canEdit() && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => setCommentModal(true)}
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Add Comment
                                        </button>
                                    )}
                                </div>
                                <div className="card-body">
                                    {complaint.comments && complaint.comments.length > 0 ? (
                                        <div className="timeline">
                                            {complaint.comments.map((comment, index) => (
                                                <div key={index} className="timeline-item mb-3 pb-3 border-bottom">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <strong>{comment.user?.name || 'Unknown User'}</strong>
                                                            {comment.is_internal && (
                                                                <span className="badge bg-warning text-dark ms-2">Internal</span>
                                                            )}
                                                        </div>
                                                        <small className="text-muted">
                                                            {formatDate(comment.created_at)}
                                                        </small>
                                                    </div>
                                                    <p className="mb-0">{comment.comment_text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                                            <p className="text-muted">No comments yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div className="card mb-4 border-0 shadow-sm">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="fas fa-history me-2 text-primary"></i>
                                        Activity History
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {complaint.actions && complaint.actions.length > 0 ? (
                                        <div className="timeline">
                                            {complaint.actions.map((action, index) => (
                                                <div key={index} className="timeline-item mb-3 pb-3 border-bottom">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <strong>{action.action_type}</strong>
                                                            <span className="text-muted ms-2">
                                                                by {action.user?.name || 'System'}
                                                            </span>
                                                        </div>
                                                        <small className="text-muted">
                                                            {formatDate(action.created_at)}
                                                        </small>
                                                    </div>
                                                    {action.remarks && (
                                                        <p className="mb-0 text-muted small">{action.remarks}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <i className="fas fa-history fa-3x text-muted mb-3"></i>
                                            <p className="text-muted">No activity recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Actions & Info */}
                        <div className="col-lg-4">
                            {/* Actions Card */}
                            <div className="card mb-4 border-0 shadow-sm">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="fas fa-tasks me-2 text-primary"></i>
                                        Actions
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="d-grid gap-2">
                                        {canEdit() && (
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={() => {
                                                    setStatusForm({ status: complaint.status, remarks: '' });
                                                    setStatusModal(true);
                                                }}
                                            >
                                                <i className="fas fa-edit me-2"></i>
                                                Update Status
                                            </button>
                                        )}
                                        {canAssign() && (
                                            <button
                                                className="btn btn-outline-info"
                                                onClick={() => {
                                                    fetchAssignees();
                                                    setAssignForm({ assigned_to: complaint.assigned_to || '', remarks: '' });
                                                    setAssignModal(true);
                                                }}
                                            >
                                                <i className="fas fa-user-plus me-2"></i>
                                                Assign/Reassign
                                            </button>
                                        )}
                                        {complaint.chat_thread_id && (
                                            <button
                                                className="btn btn-outline-success"
                                                onClick={() => navigate(`/chat/${complaint.chat_thread_id}`)}
                                            >
                                                <i className="fas fa-comments me-2"></i>
                                                Open Chat
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => navigate('/complaints/list')}
                                        >
                                            <i className="fas fa-arrow-left me-2"></i>
                                            Back to List
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Member Info Card */}
                            <div className="card mb-4 border-0 shadow-sm">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="fas fa-user me-2 text-primary"></i>
                                        Member Information
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {complaint.user ? (
                                        <>
                                            <p className="mb-2">
                                                <strong>Name:</strong><br />
                                                {complaint.user.name}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Mobile:</strong><br />
                                                {complaint.user.mobile}
                                            </p>
                                            <p className="mb-0">
                                                <strong>Email:</strong><br />
                                                {complaint.user.email || 'N/A'}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-muted mb-0">No member information</p>
                                    )}
                                </div>
                            </div>

                            {/* Assignment Info Card */}
                            <div className="card mb-4 border-0 shadow-sm">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="fas fa-user-tie me-2 text-primary"></i>
                                        Assignment
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-2">
                                        <strong>Created By:</strong><br />
                                        {complaint.created_by_user?.name || 'Unknown'}
                                    </p>
                                    <p className="mb-0">
                                        <strong>Assigned To:</strong><br />
                                        {complaint.assigned_to_user?.name || (
                                            <span className="text-muted">Not assigned</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {statusModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Status</h5>
                                <button className="btn-close" onClick={() => setStatusModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Status</label>
                                    <select
                                        className="form-select"
                                        value={statusForm.status}
                                        onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                    >
                                        <option value="NEW">New</option>
                                        <option value="ACKNOWLEDGED">Acknowledged</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                        <option value="CLOSED">Closed</option>
                                        <option value="REOPENED">Reopened</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Remarks (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={statusForm.remarks}
                                        onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                                        placeholder="Add any remarks..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setStatusModal(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleStatusUpdate}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Status'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {assignModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Complaint</h5>
                                <button className="btn-close" onClick={() => setAssignModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Assign To</label>
                                    <select
                                        className="form-select"
                                        value={assignForm.assigned_to}
                                        onChange={(e) => setAssignForm({ ...assignForm, assigned_to: e.target.value })}
                                    >
                                        <option value="">Select User</option>
                                        {assignees.map((user) => (
                                            <option key={user.user_id} value={user.user_id}>
                                                {user.name} ({user.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Remarks (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={assignForm.remarks}
                                        onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })}
                                        placeholder="Add any remarks..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setAssignModal(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAssign}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Assigning...
                                        </>
                                    ) : (
                                        'Assign'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Comment Modal */}
            {commentModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Comment</h5>
                                <button className="btn-close" onClick={() => setCommentModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Comment</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={commentForm.comment_text}
                                        onChange={(e) => setCommentForm({ ...commentForm, comment_text: e.target.value })}
                                        placeholder="Enter your comment..."
                                    ></textarea>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="isInternal"
                                        checked={commentForm.is_internal}
                                        onChange={(e) => setCommentForm({ ...commentForm, is_internal: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="isInternal">
                                        Internal Comment (Not visible to member)
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setCommentModal(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddComment}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Comment'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ViewComplaint;
