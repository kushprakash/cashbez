import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiService = ApiService();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/dsa/admin/categories');
            if (response.data.status === 1) {
                setCategories(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        
        try {
            const response = await apiService.vDelete(`/api/dsa/admin/categories/${id}`);
            if (response.data.status === 1) {
                fetchCategories();
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const handleToggleActive = async (category) => {
        try {
            const formData = new FormData();
            formData.append('is_active', !category.is_active);
            
            const response = await apiService.vPostFormData(`/api/dsa/admin/categories/${category.id}`, formData);
            if (response.data.status === 1) {
                fetchCategories();
            }
        } catch (err) {
            alert('Failed to update category');
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

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                    <i className="fa fa-folder me-2"></i>
                    Service Categories
                </h4>
                <Link to="/dsa/admin/categories/add" className="btn btn-primary">
                    <i className="fa fa-plus me-1"></i>Add Category
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{width: '60px'}}>Icon</th>
                                <th>Name</th>
                                <th style={{width: '80px'}}>Order</th>
                                <th style={{width: '80px'}}>Items</th>
                                <th style={{width: '100px'}}>Status</th>
                                <th style={{width: '150px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id}>
                                        <td>
                                            {category.icon ? (
                                                <img 
                                                    src={category.icon} 
                                                    alt={category.name}
                                                    style={{width: '40px', height: '40px', objectFit: 'contain'}}
                                                    className="rounded"
                                                />
                                            ) : (
                                                <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                                    <i className="fa fa-image text-muted"></i>
                                                </div>
                                            )}
                                        </td>
                                        <td className="align-middle fw-medium">{category.name}</td>
                                        <td className="align-middle">{category.display_order}</td>
                                        <td className="align-middle">
                                            <span className="badge bg-secondary">{category.items_count}</span>
                                        </td>
                                        <td className="align-middle">
                                            <div className="form-check form-switch">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    checked={category.is_active}
                                                    onChange={() => handleToggleActive(category)}
                                                />
                                            </div>
                                        </td>
                                        <td className="align-middle">
                                            <Link 
                                                to={`/dsa/admin/categories/edit/${category.id}`}
                                                className="btn btn-sm btn-outline-primary me-1"
                                            >
                                                <i className="fa fa-edit"></i>
                                            </Link>
                                            <Link 
                                                to={`/dsa/admin/items?category_id=${category.id}`}
                                                className="btn btn-sm btn-outline-secondary me-1"
                                                title="View Items"
                                            >
                                                <i className="fa fa-list"></i>
                                            </Link>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(category.id)}
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
        </div>
    );
};

export default CategoryList;
