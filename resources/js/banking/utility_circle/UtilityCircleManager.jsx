import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UtilityCircleManager = () => {
    const apiService = ApiService();

    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        code: '',
        name: '',
        status: true
    });

    const fetchCircles = async (searchQuery = search) => {
        setLoading(true);
        try {
            const res = await apiService.vGet(`/api/utility-circles?search=${encodeURIComponent(searchQuery)}&per_page=all`);
            if (res.data && res.data.status === 1) {
                setCircles(res.data.data || []);
            } else {
                toast.error(res.data?.message || 'Failed to load circles');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error fetching circles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCircles(search);
    }, []);

    const handleOpenModal = (cir = null) => {
        if (cir) {
            setEditId(cir.id);
            setForm({
                code: cir.code || '',
                name: cir.name || '',
                status: cir.status !== false
            });
        } else {
            setEditId(null);
            setForm({
                code: '',
                name: '',
                status: true
            });
        }
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!form.code.trim() || !form.name.trim()) {
            toast.error('Code and Name are required');
            return;
        }

        try {
            let res;
            if (editId) {
                res = await apiService.vPost(`/api/utility-circles/${editId}`, form);
            } else {
                res = await apiService.vPost('/api/utility-circles', form);
            }

            if (res.data && res.data.status === 1) {
                toast.success(editId ? 'Circle updated' : 'Circle added');
                setShowModal(false);
                fetchCircles(search);
            } else {
                toast.error(res.data?.message || 'Action failed');
            }
        } catch (err) {
            toast.error('Error submitting circle');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this circle?')) return;
        try {
            const res = await apiService.vDelete(`/api/utility-circles/${id}`);
            if (res.data && res.data.status === 1) {
                toast.success('Circle deleted');
                fetchCircles(search);
            } else {
                toast.error(res.data?.message || 'Failed to delete');
            }
        } catch (err) {
            toast.error('Error deleting circle');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await apiService.vPost(`/api/utility-circles/${id}/toggle-status`);
            if (res.data && res.data.status === 1) {
                toast.success('Circle status updated');
                fetchCircles(search);
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="card-header bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1rem', color: '#374151' }}>
                        Utility Circles Master
                    </h6>
                    <small className="text-muted">Manage telecom & state circles</small>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="btn btn-sm text-white fw-semibold px-3 py-2"
                    style={{ backgroundColor: '#6c5ce7', borderRadius: '6px' }}
                >
                    <i className="fas fa-plus me-1"></i> Add Circle
                </button>
            </div>

            <div className="card-body p-4">
                <div className="mb-3 d-flex justify-content-end">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search Circle..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            fetchCircles(e.target.value);
                        }}
                        style={{ maxWidth: '250px', borderRadius: '6px' }}
                    />
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle border mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                <th className="py-3 px-3">#</th>
                                <th className="py-3 px-3">CIRCLE CODE</th>
                                <th className="py-3 px-3">CIRCLE NAME</th>
                                <th className="py-3 px-3">STATUS</th>
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
                            ) : circles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        No circles found.
                                    </td>
                                </tr>
                            ) : (
                                circles.map((cir, idx) => (
                                    <tr key={cir.id}>
                                        <td className="py-2 px-3 text-secondary">{idx + 1}</td>
                                        <td className="py-2 px-3 text-primary fw-bold">{cir.code}</td>
                                        <td className="py-2 px-3 fw-medium text-dark">{cir.name}</td>
                                        <td className="py-2 px-3">
                                            <span
                                                className={`badge ${cir.status ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleToggleStatus(cir.id)}
                                            >
                                                {cir.status ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2 py-1 px-2"
                                                onClick={() => handleOpenModal(cir)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger py-1 px-2"
                                                onClick={() => handleDelete(cir.id)}
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
                                        {editId ? 'Edit Circle' : 'Add New Circle'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body py-3">
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Circle Code / ID <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                                            placeholder="e.g. 1 or DELHI"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Circle Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g. Delhi NCR"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="circleStatus"
                                            checked={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.checked })}
                                        />
                                        <label className="form-check-label small" htmlFor="circleStatus">Active</label>
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

export default UtilityCircleManager;
