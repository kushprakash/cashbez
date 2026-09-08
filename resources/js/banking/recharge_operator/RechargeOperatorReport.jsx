import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RechargeOperatorReport = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0
    });

    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
    const [togglingStatus, setTogglingStatus] = useState({});

    // Fetch operators list from utility_operators table
    const fetchOperators = async (page = 1, searchQuery = search, limit = perPage) => {
        setLoading(true);
        try {
            const response = await apiService.vGet(
                `/api/recharge/operators?page=${page}&per_page=${limit}&search=${encodeURIComponent(searchQuery)}`
            );

            if (response.data && response.data.status === 1) {
                setOperators(response.data.data || []);
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                }
            } else {
                toast.error(response.data?.message || 'Failed to load operators');
            }
        } catch (error) {
            console.error('Error fetching operators:', error);
            toast.error('Error fetching operator report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperators(currentPage, search, perPage);
    }, [currentPage, perPage]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        setCurrentPage(1);
        fetchOperators(1, val, perPage);
    };

    const handlePerPageChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setPerPage(val);
        setCurrentPage(1);
    };

    const handleToggleStatus = async (id, currentValue) => {
        setTogglingStatus(prev => ({ ...prev, [id]: true }));
        try {
            const response = await apiService.vPost(`/api/recharge/operators/${id}/toggle-status`, {
                field: 'is_active',
                value: !currentValue
            });

            if (response.data && response.data.status === 1) {
                toast.success('Status updated');
                setOperators(prev =>
                    prev.map(op => (op.id === id ? { ...op, is_active: !currentValue } : op))
                );
            } else {
                toast.error(response.data?.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Failed to toggle status');
        } finally {
            setTogglingStatus(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleDeleteClick = (op) => {
        setDeleteModal({ show: true, id: op.id, name: op.name });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            const response = await apiService.vDelete(`/api/recharge/operators/${deleteModal.id}`);
            if (response.data && response.data.status === 1) {
                toast.success('Operator deleted successfully');
                setDeleteModal({ show: false, id: null, name: '' });
                fetchOperators(currentPage, search, perPage);
            } else {
                toast.error(response.data?.message || 'Failed to delete operator');
            }
        } catch (error) {
            toast.error('Error deleting operator');
        }
    };

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Breadcrumb Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ color: '#4b5563', fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Utility Operator / </span>
                        <span className="text-secondary fw-bold">Report</span>
                    </h5>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/recharge/operator/add')}
                        className="btn px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#6c5ce7',
                            borderColor: '#6c5ce7',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-plus"></i> ADD OPERATOR
                    </button>
                </div>
            </div>

            {/* Main Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2">
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1rem', color: '#374151' }}>
                        Utility Operators Report
                    </h6>
                </div>

                <div className="card-body p-4">
                    {/* Controls Row */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-secondary small">Show</span>
                            <select
                                className="form-select form-select-sm"
                                value={perPage}
                                onChange={handlePerPageChange}
                                style={{ width: '80px', borderRadius: '6px' }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-secondary small">entries</span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="text-secondary small fw-medium">Search:</span>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search Name/Code/Category..."
                                value={search}
                                onChange={handleSearchChange}
                                style={{ width: '240px', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 border" style={{ fontSize: '0.85rem' }}>
                            <thead style={{ backgroundColor: '#f8fafc' }}>
                                <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    <th className="py-3 px-3">SR NO</th>
                                    <th className="py-3 px-3">OPERATOR NAME</th>
                                    <th className="py-3 px-3">OPERATOR CODE</th>
                                    <th className="py-3 px-3">CATEGORY / TYPE</th>
                                    <th className="py-3 px-3">STATE / CIRCLE</th>
                                    <th className="py-3 px-3">STATUS</th>
                                    <th className="py-3 px-3 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : operators.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            No operators found in utility_operators table. Click "+ ADD OPERATOR" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    operators.map((op, idx) => {
                                        const srNo = (pagination.current_page - 1) * pagination.per_page + idx + 1;
                                        const opIcon = op.icon || op.logo || op.biller_icon;
                                        const activeVal = op.is_active !== undefined ? op.is_active : op.status;
                                        return (
                                            <tr key={op.id} className="border-bottom">
                                                <td className="py-3 px-3 text-secondary">{srNo}</td>
                                                <td className="py-3 px-3 fw-medium text-dark">
                                                    <div className="d-flex align-items-center gap-2">
                                                        {opIcon ? (
                                                            <img
                                                                src={opIcon}
                                                                alt={op.name}
                                                                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        ) : null}
                                                        <div>
                                                            <span>{op.name}</span>
                                                            {op.label && op.label !== op.name && (
                                                                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{op.label}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-primary fw-bold">{op.code || op.operator_code}</td>
                                                <td className="py-3 px-3 text-secondary">{op.category || op.type || '-'}</td>
                                                <td className="py-3 px-3 text-secondary">{op.state || '-'}</td>

                                                {/* STATUS Toggle */}
                                                <td className="py-3 px-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                                                            <input
                                                                className="form-check-input ms-0 me-2"
                                                                type="checkbox"
                                                                role="switch"
                                                                checked={!!activeVal}
                                                                onChange={() => handleToggleStatus(op.id, activeVal)}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    backgroundColor: activeVal ? '#22c55e' : '#cbd5e1',
                                                                    borderColor: activeVal ? '#22c55e' : '#cbd5e1',
                                                                    width: '38px',
                                                                    height: '20px'
                                                                }}
                                                            />
                                                        </div>
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                backgroundColor: activeVal ? '#dcfce7' : '#f1f5f9',
                                                                color: activeVal ? '#16a34a' : '#64748b',
                                                                fontWeight: '700',
                                                                fontSize: '0.725rem',
                                                                letterSpacing: '0.5px'
                                                            }}
                                                        >
                                                            {activeVal ? 'ACTIVE' : 'INACTIVE'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Action Edit */}
                                                <td className="py-3 px-3 text-center">
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/recharge/operator/edit/${op.id}`)}
                                                            className="btn btn-sm text-white d-inline-flex align-items-center justify-content-center p-2"
                                                            style={{
                                                                backgroundColor: '#6366f1',
                                                                borderRadius: '6px',
                                                                width: '32px',
                                                                height: '32px'
                                                            }}
                                                            title="Edit Operator"
                                                        >
                                                            <i className="fas fa-pencil-alt" style={{ fontSize: '0.8rem' }}></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(op)}
                                                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-2"
                                                            style={{
                                                                borderRadius: '6px',
                                                                width: '32px',
                                                                height: '32px'
                                                            }}
                                                            title="Delete Operator"
                                                        >
                                                            <i className="fas fa-trash-alt" style={{ fontSize: '0.8rem' }}></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4 pt-2">
                        <div className="text-secondary small">
                            Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} entries
                        </div>

                        <ul className="pagination pagination-sm m-0 gap-1">
                            <li className={`page-item ${pagination.current_page <= 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-item border-0 bg-transparent text-secondary small px-2"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    Previous
                                </button>
                            </li>

                            {Array.from({ length: pagination.last_page || 1 }, (_, i) => i + 1).map(pageNum => (
                                <li key={pageNum} className="page-item">
                                    <button
                                        className="btn btn-sm px-3 fw-semibold"
                                        style={{
                                            backgroundColor: pagination.current_page === pageNum ? '#6366f1' : '#f1f5f9',
                                            color: pagination.current_page === pageNum ? '#ffffff' : '#475569',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem'
                                        }}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${pagination.current_page >= pagination.last_page ? 'disabled' : ''}`}>
                                <button
                                    className="page-item border-0 bg-transparent text-secondary small px-2"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-danger">Delete Operator</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                                ></button>
                            </div>
                            <div className="modal-body py-4">
                                <p className="mb-0 text-secondary">
                                    Are you sure you want to delete operator <strong className="text-dark">{deleteModal.name}</strong>?
                                </p>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-3"
                                    onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger rounded-3 px-4"
                                    onClick={confirmDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RechargeOperatorReport;
