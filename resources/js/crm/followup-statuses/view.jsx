import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const ViewFollowupStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [followupStatus, setFollowupStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const apiService = ApiService();

    useEffect(() => {
        fetchFollowupStatus();
    }, [id]);

    const fetchFollowupStatus = async () => {
        try {
            setLoading(true);
            
            let response;
            if (apiService.vGet) {
                response = await apiService.vGet(`/api/crm/followup-statuses/${id}`);
            } else if (apiService.get) {
                response = await apiService.get(`/api/crm/followup-statuses/${id}`);
            } else {
                const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                const httpAuth = axiosAuthorization(authToken, user?.authorization);
                response = await httpAuth.get(`/api/crm/followup-statuses/${id}`);
            }

            if (response?.data) {
                setFollowupStatus(response.data);
            }
        } catch (error) {
            console.error('Error fetching followup status:', error);
            toast.error('Error fetching followup status details');
            navigate('/crm/followup-statuses/list');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this followup status?')) {
            try {
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/followup-statuses/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/followup-statuses`, id);
                } else {
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/followup-statuses/${id}`);
                }
                
                toast.success('Followup status deleted successfully');
                navigate('/crm/followup-statuses/list');
            } catch (error) {
                toast.error('Error deleting followup status. Please try again.');
            }
        }
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        const date = new Date(dateTime);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (!followupStatus) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    <h4>Followup Status Not Found</h4>
                    <p>The requested followup status could not be found.</p>
                    <Link to="/crm/followup-statuses/list" className="btn btn-primary">
                        Back to Followup Statuses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Pageheader 
                currentpage="View Followup Status" 
                activepage="CRM" 
                mainpage="Followup Status Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Followup Status Details</h5>
                            <div className="d-flex gap-2">
                                <Link 
                                    to={`/crm/followup-statuses/edit/${id}`}
                                    className="btn btn-primary btn-sm"
                                >
                                    <i className="fa fa-edit me-2"></i>Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-danger btn-sm"
                                >
                                    <i className="fa fa-trash me-2"></i>Delete
                                </button>
                                <Link 
                                    to="/crm/followup-statuses/list"
                                    className="btn btn-secondary btn-sm"
                                >
                                    <i className="fa fa-arrow-left me-2"></i>Back to List
                                </Link>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <table className="table table-borderless">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" style={{ width: '150px' }}>ID:</td>
                                                <td>#{followupStatus.id}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Name:</td>
                                                <td>{followupStatus.name}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Description:</td>
                                                <td>{followupStatus.description || 'No description provided'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Followup Type:</td>
                                                <td>
                                                    {followupStatus.followup_type ? (
                                                        <span className="badge bg-info">
                                                            {followupStatus.followup_type.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">Not assigned</span>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Color:</td>
                                                <td>
                                                    <span 
                                                        className="badge me-2" 
                                                        style={{ backgroundColor: followupStatus.color }}
                                                    >
                                                        {followupStatus.name}
                                                    </span>
                                                    <small className="text-muted">{followupStatus.color}</small>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Sort Order:</td>
                                                <td>
                                                    <span className="badge bg-secondary">
                                                        {followupStatus.sort_order || 0}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Status:</td>
                                                <td>
                                                    <span className={`badge ${followupStatus.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                        {followupStatus.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-6">
                                    <table className="table table-borderless">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" style={{ width: '120px' }}>Created:</td>
                                                <td>{formatDateTime(followupStatus.created_at)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Updated:</td>
                                                <td>{formatDateTime(followupStatus.updated_at)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Created By:</td>
                                                <td>
                                                    {followupStatus.created_by ? (
                                                        <span className="badge bg-info">
                                                            {followupStatus.created_by?.name || `User #${followupStatus.created_by}`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">System</span>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Admin:</td>
                                                <td>
                                                    {followupStatus.admin ? (
                                                        <span className="badge bg-primary">
                                                            {followupStatus.admin.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">Not assigned</span>
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="border-top pt-3">
                                        <h6 className="text-muted mb-3">Additional Information</h6>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="card bg-light">
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title text-primary">Usage Statistics</h5>
                                                        <p className="card-text">
                                                            <span className="h4 text-success">0</span><br />
                                                            <small className="text-muted">Active Followups</small>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="card bg-light">
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title text-info">Preview</h5>
                                                        <p className="card-text">
                                                            <span 
                                                                className="badge" 
                                                                style={{ 
                                                                    backgroundColor: followupStatus.color,
                                                                    fontSize: '14px',
                                                                    padding: '8px 12px'
                                                                }}
                                                            >
                                                                {followupStatus.name}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="card bg-light">
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title text-warning">Quick Actions</h5>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <Link 
                                                                to={`/crm/followup-statuses/edit/${id}`}
                                                                className="btn btn-sm btn-outline-primary"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <Link 
                                                                to="/crm/followup-statuses/add"
                                                                className="btn btn-sm btn-outline-success"
                                                            >
                                                                Add New
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default ViewFollowupStatus;
