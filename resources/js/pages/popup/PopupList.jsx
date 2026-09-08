import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pageheader from '../../layouts/Pageheader';

const PopupList = () => {
    const apiService = ApiService();
    const [popups, setPopups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [screen, setScreen] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPopups();
    }, [page, search, status, screen]);

    const fetchPopups = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 25 };
            if (search) params.search = search;
            if (status) params.status = status;
            if (screen) params.screen = screen;

            const response = await apiService.vGet('/api/popups', { params });
            if (response.data.status === 1) {
                setPopups(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
            }
        } catch (error) {
            console.error('Error fetching popups:', error);
            toast.error('Failed to load popups');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this popup?')) return;
        
        try {
            await apiService.vDelete(`/api/popups/${id}`);
            toast.success('Popup deleted successfully');
            fetchPopups();
        } catch (error) {
            toast.error('Failed to delete popup');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const response = await apiService.vPost(`/api/popups/${id}/toggle-status`);
            if (response.data.status === 1) {
                toast.success('Status updated successfully');
                fetchPopups();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getPopupTypeBadge = (type) => {
        const colors = {
            'general': 'bg-info',
            'offer': 'bg-warning',
            'announcement': 'bg-primary',
            'custom': 'bg-secondary'
        };
        return colors[type] || 'bg-secondary';
    };

    return (
        <>
            <Pageheader mainheading="Popup Management" parentfolder="App" activepage="Popups" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">All Popups</h5>
                            <Link to="/popup/add" className="btn btn-primary btn-sm">
                                <i className="fas fa-plus me-1"></i> Add Popup
                            </Link>
                        </div>

                        {/* Filters */}
                        <div className="card-body pb-2">
                            <div className="row g-2">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search popups..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <select
                                        className="form-select form-select-sm"
                                        value={status}
                                        onChange={(e) => {
                                            setStatus(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <select
                                        className="form-select form-select-sm"
                                        value={screen}
                                        onChange={(e) => {
                                            setScreen(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="">All Screens</option>
                                        <option value="home">Home</option>
                                        <option value="login">Login</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                                <div className="col-md-2 text-end">
                                    <button className="btn btn-sm btn-outline-primary" onClick={fetchPopups}>
                                        <i className="fas fa-sync"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : popups.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    No popups found
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th style={{width: '60px'}}>Image</th>
                                                <th>Title</th>
                                                <th>Type</th>
                                                <th>Screen</th>
                                                <th>Priority</th>
                                                <th>Status</th>
                                                <th>Display Period</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {popups.map((popup) => (
                                                <tr key={popup.id}>
                                                    <td>
                                                        {popup.image_url ? (
                                                            <img 
                                                                src={popup.image_url} 
                                                                alt="Popup" 
                                                                style={{
                                                                    width: '50px', 
                                                                    height: '50px', 
                                                                    objectFit: 'cover',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-muted">
                                                                <i className="fas fa-image"></i>
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="fw-medium">{popup.title || 'No Title'}</div>
                                                        <small className="text-muted">
                                                            {popup.message ? popup.message.substring(0, 40) + '...' : ''}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getPopupTypeBadge(popup.popup_type)} text-capitalize`}>
                                                            {popup.popup_type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-primary text-capitalize">
                                                            {popup.show_on_screen}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            {popup.priority || 10}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span 
                                                            className={`badge ${popup.status === 'active' ? 'bg-success' : 'bg-secondary'}`}
                                                            style={{cursor: 'pointer'}}
                                                            onClick={() => handleToggleStatus(popup.id)}
                                                        >
                                                            {popup.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small>
                                                            {formatDate(popup.display_start)}<br/>
                                                            to {formatDate(popup.display_end)}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <Link
                                                            to={`/popup/edit/${popup.id}`}
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Link>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(popup.id)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="card-footer bg-white">
                                <nav>
                                    <ul className="pagination pagination-sm justify-content-center mb-0">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page - 1)}>
                                                Previous
                                            </button>
                                        </li>
                                        {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                            <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(i + 1)}>
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page + 1)}>
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PopupList;
