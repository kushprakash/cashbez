import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

const ItemList = () => {
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('category_id');

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryId || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const apiService = ApiService();

    useEffect(() => {
        fetchCategories();
        fetchItems();
    }, []);

    useEffect(() => {
        fetchItems();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await apiService.vGet('/api/dsa/admin/categories');
            if (response.data.status === 1) {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories');
        }
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            const url = selectedCategory
                ? `/api/dsa/admin/items?category_id=${selectedCategory}`
                : '/api/dsa/admin/items';
            const response = await apiService.vGet(url);
            if (response.data.status === 1) {
                setItems(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await apiService.vDelete(`/api/dsa/admin/items/${id}`);
            if (response.data.status === 1) {
                fetchItems();
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const handleToggleActive = async (item) => {
        try {
            const formData = new FormData();
            formData.append('is_active', !item.is_active);

            const response = await apiService.vPostFormData(`/api/dsa/admin/items/${item.id}`, formData);
            if (response.data.status === 1) {
                fetchItems();
            }
        } catch (err) {
            alert('Failed to update item');
        }
    };

    const handleViewInfo = (item) => {
        setViewItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setViewItem(null);
    };

    const hasInfo = (item) => {
        return (item.target_audience?.length > 0 || item.terms_conditions?.length > 0 || item.instructions?.length > 0);
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                    <i className="fa fa-th me-2"></i>
                    Service Items
                </h4>
                <Link to="/dsa/admin/items/add" className="btn btn-primary">
                    <i className="fa fa-plus me-1"></i>Add Item
                </Link>
            </div>

            <div className="row mb-3">
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '50px' }}>Icon</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th style={{ width: '80px' }}>Info</th>
                                <th style={{ width: '80px' }}>Order</th>
                                <th style={{ width: '100px' }}>Platforms</th>
                                <th style={{ width: '80px' }}>Status</th>
                                <th style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        No items found
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            {item.icon ? (
                                                <img
                                                    src={item.icon}
                                                    alt={item.title}
                                                    style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                                                    className="rounded"
                                                />
                                            ) : (
                                                <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                                    <i className="fa fa-image text-muted small"></i>
                                                </div>
                                            )}
                                        </td>
                                        <td className="align-middle">
                                            <div className="fw-medium">{item.title}</div>
                                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                                                {item.link}
                                            </small>
                                        </td>
                                        <td className="align-middle">
                                            <span className="badge bg-light text-dark">
                                                {item.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="align-middle">
                                            {hasInfo(item) ? (
                                                <button
                                                    className="btn btn-sm btn-outline-info"
                                                    onClick={() => handleViewInfo(item)}
                                                    title="View Details"
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </button>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td className="align-middle">{item.display_order}</td>
                                        <td className="align-middle">
                                            {item.android && <span className="badge bg-success me-1">Android</span>}
                                            {item.web && <span className="badge bg-primary">Web</span>}
                                        </td>
                                        <td className="align-middle">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={item.is_active}
                                                    onChange={() => handleToggleActive(item)}
                                                />
                                            </div>
                                        </td>
                                        <td className="align-middle">
                                            <Link
                                                to={`/dsa/admin/items/edit/${item.id}`}
                                                className="btn btn-sm btn-outline-primary me-1"
                                            >
                                                <i className="fa fa-edit"></i>
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Info Modal */}
            {showModal && viewItem && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-info-circle me-2"></i>
                                    {viewItem.title} - Details
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {/* Target Audience */}
                                    <div className="col-md-4">
                                        <div className="card h-100 border-0 bg-light">
                                            <div className="card-body">
                                                <h6 className="card-title text-primary">
                                                    <i className="fa fa-users me-2"></i>Target Audience
                                                </h6>
                                                {viewItem.target_audience?.length > 0 ? (
                                                    <ul className="list-unstyled mb-0">
                                                        {viewItem.target_audience.map((item, i) => (
                                                            <li key={i} className="mb-1">
                                                                <i className="fa fa-check-circle text-success me-2"></i>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-muted mb-0">No target audience defined</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terms & Conditions */}
                                    <div className="col-md-4">
                                        <div className="card h-100 border-0 bg-light">
                                            <div className="card-body">
                                                <h6 className="card-title text-warning">
                                                    <i className="fa fa-file-contract me-2"></i>Terms & Conditions
                                                </h6>
                                                {viewItem.terms_conditions?.length > 0 ? (
                                                    <ol className="mb-0 ps-3">
                                                        {viewItem.terms_conditions.map((item, i) => (
                                                            <li key={i} className="mb-1">{item}</li>
                                                        ))}
                                                    </ol>
                                                ) : (
                                                    <p className="text-muted mb-0">No terms defined</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="col-md-4">
                                        <div className="card h-100 border-0 bg-light">
                                            <div className="card-body">
                                                <h6 className="card-title text-info">
                                                    <i className="fa fa-list-ol me-2"></i>Instructions
                                                </h6>
                                                {viewItem.instructions?.length > 0 ? (
                                                    <ol className="mb-0 ps-3">
                                                        {viewItem.instructions.map((item, i) => (
                                                            <li key={i} className="mb-1">{item}</li>
                                                        ))}
                                                    </ol>
                                                ) : (
                                                    <p className="text-muted mb-0">No instructions defined</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Close
                                </button>
                                <Link to={`/dsa/admin/items/edit/${viewItem.id}`} className="btn btn-primary">
                                    <i className="fa fa-edit me-1"></i>Edit
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemList;

