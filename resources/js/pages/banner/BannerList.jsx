import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';

const BannerList = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiService = ApiService();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/admin/banners');
            if (response.data.status === 1) {
                setBanners(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to fetch banners');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const response = await apiService.vPost(`/api/admin/banners/${id}/toggle-status`);
            if (response.data.status === 1) {
                toast.success(response.data.message);
                fetchBanners();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error('Failed to toggle status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) {
            return;
        }

        try {
            const response = await apiService.vDelete(`/api/admin/banners/${id}`);
            if (response.data.status === 1) {
                toast.success('Banner deleted successfully');
                fetchBanners();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error('Failed to delete banner');
        }
    };

    if (loading) {
        return (
            <div className="container-fluid mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid mt-4">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                    <i className="fa fa-image me-2"></i>
                    Banner Management
                </h4>
                <Link to="/admin/banners/create" className="btn btn-primary">
                    <i className="fa fa-plus me-1"></i>Add Banner
                </Link>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{width: '80px'}}>ID</th>
                                    <th style={{width: '150px'}}>Preview</th>
                                    <th>Type</th>
                                    <th style={{width: '100px'}}>Status</th>
                                    <th style={{width: '150px'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            No banners found
                                        </td>
                                    </tr>
                                ) : (
                                    banners.map(banner => (
                                        <tr key={banner.id}>
                                            <td>{banner.id}</td>
                                            <td>
                                                <img 
                                                    src={banner.image} 
                                                    alt={`Banner ${banner.id}`}
                                                    style={{
                                                        width: '120px',
                                                        height: '60px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <span className="badge bg-secondary">{banner.type}</span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${banner.status ? 'btn-success' : 'btn-outline-secondary'}`}
                                                    onClick={() => handleToggleStatus(banner.id)}
                                                >
                                                    {banner.status ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <Link 
                                                        to={`/admin/banners/${banner.id}/edit`}
                                                        className="btn btn-outline-primary"
                                                    >
                                                        <i className="fa fa-edit"></i>
                                                    </Link>
                                                    <button 
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDelete(banner.id)}
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerList;
