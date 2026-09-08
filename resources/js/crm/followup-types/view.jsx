import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const ViewFollowupType = () => {
    const { id } = useParams();
    const [followupType, setFollowupType] = useState(null);
    const [followupStatuses, setFollowupStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusesLoading, setStatusesLoading] = useState(false);
    const apiService = ApiService();

    useEffect(() => {
        fetchFollowupType();
        fetchFollowupStatuses();
    }, [id]);

    const fetchFollowupType = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet(`/api/crm/followup-types/${id}`);
            
            if (response.data) {
                setFollowupType(response.data);
            } else {
                toast.error('Followup type not found');
            }
        } catch (error) {
            console.error('Error fetching followup type:', error);
            toast.error('Error fetching followup type data');
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowupStatuses = async () => {
        try {
            setStatusesLoading(true);
            const response = await apiService.vGet(`/api/crm/followup-statuses?followup_type_id=${id}`);
            
            if (response.data) {
                setFollowupStatuses(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching followup statuses:', error);
            setFollowupStatuses([]);
        } finally {
            setStatusesLoading(false);
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

    if (!followupType) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    <h4>Followup Type Not Found</h4>
                    <p>The requested followup type could not be found.</p>
                    <Link to="/crm/followup-types/list" className="btn btn-primary">
                        Back to Followup Types
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Pageheader 
                currentpage="View Followup Type" 
                activepage="CRM" 
                mainpage="Followup Type Management" 
            />
            
            <div className="row">
                {/* Main Details */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                <span 
                                    className="badge me-3" 
                                    style={{ backgroundColor: followupType.color, fontSize: '16px' }}
                                >
                                    <i className="fa fa-calendar me-2"></i>
                                    {followupType.name}
                                </span>
                                Followup Type Details
                            </h5>
                            <div className="btn-group">
                                <Link 
                                    to={`/crm/followup-types/edit/${followupType.id}`}
                                    className="btn btn-primary btn-sm"
                                >
                                    <i className="fa fa-edit me-1"></i>
                                    Edit
                                </Link>
                                <Link 
                                    to="/crm/followup-types/list"
                                    className="btn btn-secondary btn-sm"
                                >
                                    <i className="fa fa-arrow-left me-1"></i>
                                    Back to List
                                </Link>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <table className="table table-borderless">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" style={{ width: '120px' }}>ID:</td>
                                                <td>{followupType.id}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Name:</td>
                                                <td>{followupType.name}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Color:</td>
                                                <td>
                                                    <span 
                                                        className="badge me-2" 
                                                        style={{ backgroundColor: followupType.color }}
                                                    >
                                                        {followupType.name}
                                                    </span>
                                                    <small className="text-muted">{followupType.color}</small>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Sort Order:</td>
                                                <td>
                                                    <span className="badge bg-secondary">
                                                        {followupType.sort_order || 0}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Status:</td>
                                                <td>
                                                    <span className={`badge ${followupType.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                        {followupType.is_active ? 'Active' : 'Inactive'}
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
                                                <td>{formatDateTime(followupType.created_at)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Updated:</td>
                                                <td>{formatDateTime(followupType.updated_at)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Created By:</td>
                                                <td>
                                                    {followupType.created_by ? (
                                                        <span className="badge bg-info">
                                                            {followupType.created_by?.name || `User #${followupType.created_by}`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">System</span>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Admin:</td>
                                                <td>
                                                    {followupType.admin ? (
                                                        <span className="badge bg-primary">
                                                            {followupType.admin.name}
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

                            {followupType.description && (
                                <div className="mt-4">
                                    <h6 className="fw-bold">Description:</h6>
                                    <div className="alert alert-light">
                                        {followupType.description}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Associated Statuses */}
                    <div className="card mt-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-list me-2"></i>
                                Associated Followup Statuses
                            </h6>
                        </div>
                        <div className="card-body">
                            {statusesLoading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                    <p className="mt-2 mb-0 text-muted">Loading statuses...</p>
                                </div>
                            ) : followupStatuses.length > 0 ? (
                                <div className="row">
                                    {followupStatuses.map((status) => (
                                        <div key={status.id} className="col-md-6 mb-3">
                                            <div className="card border">
                                                <div className="card-body p-3">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <span 
                                                                className="badge mb-2" 
                                                                style={{ backgroundColor: status.color }}
                                                            >
                                                                {status.name}
                                                            </span>
                                                            {status.description && (
                                                                <p className="small text-muted mb-1">
                                                                    {status.description}
                                                                </p>
                                                            )}
                                                            <small className="text-muted">
                                                                Order: {status.sort_order || 0}
                                                            </small>
                                                        </div>
                                                        <span className={`badge ${status.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                            {status.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fa fa-list fa-3x text-muted mb-3"></i>
                                    <p className="text-muted">No followup statuses associated with this type.</p>
                                    <Link 
                                        to="/crm/followup-statuses/add" 
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        <i className="fa fa-plus me-1"></i>
                                        Add Followup Status
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-cog me-2"></i>
                                Actions
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                <Link 
                                    to={`/crm/followup-types/edit/${followupType.id}`}
                                    className="btn btn-primary"
                                >
                                    <i className="fa fa-edit me-2"></i>
                                    Edit Followup Type
                                </Link>
                                <Link 
                                    to="/crm/followup-statuses/add"
                                    className="btn btn-success"
                                >
                                    <i className="fa fa-plus me-2"></i>
                                    Add Followup Status
                                </Link>
                                <Link 
                                    to="/crm/followup-types/list"
                                    className="btn btn-outline-secondary"
                                >
                                    <i className="fa fa-arrow-left me-2"></i>
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-3">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-info-circle me-2"></i>
                                Usage Information
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="small">
                                <p><strong>Status Count:</strong> {followupStatuses.length} associated statuses</p>
                                <p><strong>Active Statuses:</strong> {followupStatuses.filter(s => s.is_active).length}</p>
                                <p className="mb-0">
                                    <strong>Last Updated:</strong><br />
                                    {formatDateTime(followupType.updated_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default ViewFollowupType;
