import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BbpsCategoryManager = () => {
    const apiService = ApiService();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        name: '',
        category: '',
        label: '',
        image: '',
        popular: false
    });

    const fetchCategories = async (searchQuery = search) => {
        setLoading(true);
        try {
            const res = await apiService.vGet(`/api/bbps-categories?search=${encodeURIComponent(searchQuery)}&per_page=all`);
            if (res.data && res.data.status === 1) {
                setCategories(res.data.data || []);
            } else {
                toast.error(res.data?.message || 'Failed to load categories');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error fetching categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories(search);
    }, []);

    const handleOpenModal = (cat = null) => {
        if (cat) {
            setEditId(cat.id);
            setForm({
                name: cat.name || '',
                category: cat.category || '',
                label: cat.label || '',
                image: cat.image || '',
                popular: !!cat.popular
            });
        } else {
            setEditId(null);
            setForm({
                name: '',
                category: '',
                label: '',
                image: '',
                popular: false
            });
        }
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.category.trim()) {
            toast.error('Name and Category slug are required');
            return;
        }

        try {
            let res;
            if (editId) {
                res = await apiService.vPost(`/api/bbps-categories/${editId}`, form);
            } else {
                res = await apiService.vPost('/api/bbps-categories', form);
            }

            if (res.data && res.data.status === 1) {
                toast.success(editId ? 'Category updated' : 'Category added');
                setShowModal(false);
                fetchCategories(search);
            } else {
                toast.error(res.data?.message || 'Action failed');
            }
        } catch (err) {
            toast.error('Error submitting category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await apiService.vDelete(`/api/bbps-categories/${id}`);
            if (res.data && res.data.status === 1) {
                toast.success('Category deleted');
                fetchCategories(search);
            } else {
                toast.error(res.data?.message || 'Failed to delete');
            }
        } catch (err) {
            toast.error('Error deleting category');
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="card-header bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1rem', color: '#374151' }}>
                        BBPS Category Master
                    </h6>
                    <small className="text-muted">Manage BBPS service categories</small>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="btn btn-sm text-white fw-semibold px-3 py-2"
                    style={{ backgroundColor: '#6c5ce7', borderRadius: '6px' }}
                >
                    <i className="fas fa-plus me-1"></i> Add Category
                </button>
            </div>

            <div className="card-body p-4">
                <div className="mb-3 d-flex justify-content-end">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search Category..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            fetchCategories(e.target.value);
                        }}
                        style={{ maxWidth: '250px', borderRadius: '6px' }}
                    />
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle border mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                <th className="py-3 px-3">#</th>
                                <th className="py-3 px-3">NAME</th>
                                <th className="py-3 px-3">CATEGORY SLUG</th>
                                <th className="py-3 px-3">LABEL</th>
                                <th className="py-3 px-3 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat, idx) => (
                                    <tr key={cat.id}>
                                        <td className="py-2 px-3 text-secondary">{idx + 1}</td>
                                        <td className="py-2 px-3 fw-medium text-dark">{cat.name}</td>
                                        <td className="py-2 px-3 text-primary fw-semibold">{cat.category}</td>
                                        <td className="py-2 px-3 text-secondary">{cat.label || cat.name}</td>
                                        <td className="py-2 px-3 text-center">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2 py-1 px-2"
                                                onClick={() => handleOpenModal(cat)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger py-1 px-2"
                                                onClick={() => handleDelete(cat.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <form onSubmit={handleFormSubmit}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold text-dark">
                                        {editId ? 'Edit Category' : 'Add New Category'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body py-3">
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Category Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g. Mobile Prepaid"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Category Slug / Code <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            placeholder="e.g. Prepaid or MobilePrepaid"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Display Label</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.label}
                                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                                            placeholder="Optional display label"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-3" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary rounded-3 px-4">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BbpsCategoryManager;
