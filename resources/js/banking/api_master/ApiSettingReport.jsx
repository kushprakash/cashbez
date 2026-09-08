import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiSpecialSettingModal from './ApiSpecialSettingModal';

const fallbackCircles = [
    { id: 1, name: 'Bihar & Jharkhand' },
    { id: 2, name: 'Delhi NCR' },
    { id: 3, name: 'Mumbai' },
    { id: 4, name: 'Kolkata' },
    { id: 5, name: 'Maharashtra & Goa' },
    { id: 6, name: 'West Bengal' },
    { id: 7, name: 'Uttar Pradesh (East)' },
    { id: 8, name: 'Uttar Pradesh (West)' },
    { id: 9, name: 'Gujarat' },
    { id: 10, name: 'Punjab' },
    { id: 11, name: 'Rajasthan' },
    { id: 12, name: 'Madhya Pradesh & CG' },
    { id: 13, name: 'Karnataka' },
    { id: 14, name: 'Tamil Nadu' },
    { id: 15, name: 'Andhra Pradesh & Telangana' },
    { id: 16, name: 'Kerala' },
    { id: 17, name: 'Haryana' },
    { id: 18, name: 'Himachal Pradesh' },
    { id: 19, name: 'Assam' },
    { id: 20, name: 'North East' },
    { id: 21, name: 'Odisha' },
    { id: 22, name: 'Jammu & Kashmir' },
];

const ApiSettingReport = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    const [settings, setSettings] = useState([]);
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
    const [specialModal, setSpecialModal] = useState({ show: false, item: null });
    const [utilityCircles, setUtilityCircles] = useState([]);

    const fetchCircles = async () => {
        try {
            const response = await apiService.vGet('/api/utility-circles');
            if (response.data && response.data.status === 1 && Array.isArray(response.data.data)) {
                setUtilityCircles(response.data.data);
            }
        } catch (error) {
            // ignore
        }
    };

    const fetchSettings = async (page = 1, searchQuery = search, limit = perPage) => {
        setLoading(true);
        try {
            const response = await apiService.vGet(
                `/api/api-settings?page=${page}&per_page=${limit}&search=${encodeURIComponent(searchQuery)}`
            );

            if (response.data && response.data.status === 1) {
                setSettings(response.data.data || []);
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                }
            } else {
                toast.error(response.data?.message || 'Failed to load API settings');
            }
        } catch (error) {
            toast.error('Error fetching API settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCircles();
        fetchSettings(currentPage, search, perPage);
    }, [currentPage, perPage]);

    const handleUpdateCircle = async (apiId, selectedCircle) => {
        try {
            const response = await apiService.vPost(`/api/api-settings/${apiId}/circle`, { circle: selectedCircle });
            if (response.data && response.data.status === 1) {
                toast.success(`API Circle updated to ${selectedCircle}`);
                fetchSettings(currentPage, search, perPage);
            } else {
                toast.error(response.data?.message || 'Failed to update API Circle');
            }
        } catch (error) {
            toast.error('Error updating API Circle');
        }
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        setCurrentPage(1);
        fetchSettings(1, val, perPage);
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            const response = await apiService.vDelete(`/api/api-settings/${deleteModal.id}`);
            if (response.data && response.data.status === 1) {
                toast.success('API Master deleted successfully');
                setDeleteModal({ show: false, id: null, name: '' });
                fetchSettings(currentPage, search, perPage);
            } else {
                toast.error(response.data?.message || 'Failed to delete API setting');
            }
        } catch (error) {
            toast.error('Error deleting API setting');
        }
    };

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Breadcrumb Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ color: '#4b5563', fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Apis / </span>
                        <span className="text-secondary fw-bold">Report</span>
                    </h5>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/api-master/service-wise-setting')}
                        className="btn px-3 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#3b82f6',
                            borderColor: '#3b82f6',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-layer-group"></i> SERVICE WISE API SETTING
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/api-master/pending-setting')}
                        className="btn px-3 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#0284c7',
                            borderColor: '#0284c7',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-clock"></i> PENDING API SETTING
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/api-master/operator-mapping')}
                        className="btn px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#10b981',
                            borderColor: '#10b981',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-sitemap"></i> OPERATOR MAPPING
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/api-master/setting/add')}
                        className="btn px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#6c5ce7',
                            borderColor: '#6c5ce7',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-plus"></i> ADD API
                    </button>
                </div>
            </div>

            {/* Main Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2">
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1rem', color: '#374151' }}>
                        API Settings Master Report
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
                                onChange={(e) => { setPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                                style={{ width: '80px', borderRadius: '6px' }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-secondary small">entries</span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="text-secondary small fw-medium">Search:</span>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder=""
                                value={search}
                                onChange={handleSearchChange}
                                style={{ width: '220px', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 border" style={{ fontSize: '0.85rem' }}>
                            <thead style={{ backgroundColor: '#f8fafc' }}>
                                <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    <th className="py-3 px-3">SR NO</th>
                                    <th className="py-3 px-3">API NAME</th>
                                    <th className="py-3 px-3">SHORT NAME</th>
                                    <th className="py-3 px-3">IP ADDRESS</th>
                                    <th className="py-3 px-3">SERVICES</th>
                                    <th className="py-3 px-3 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : settings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            No API Settings configured yet. Click "+ ADD API" to add one.
                                        </td>
                                    </tr>
                                ) : (
                                    settings.map((item, idx) => {
                                        const srNo = (pagination.current_page - 1) * pagination.per_page + idx + 1;
                                        return (
                                            <tr key={item.id} className="border-bottom">
                                                <td className="py-3 px-3 text-secondary">{srNo}</td>
                                                <td className="py-3 px-3 fw-bold text-dark">{item.api_name}</td>
                                                <td className="py-3 px-3 text-secondary fw-semibold">{item.api_short_name}</td>
                                                <td className="py-3 px-3 text-secondary">{item.ip_address || '-'}</td>
                                                <td className="py-3 px-3 text-secondary">
                                                    {Array.isArray(item.services) && item.services.length > 0 ? (
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {item.services.slice(0, 4).map((s, i) => (
                                                                <span key={i} className="badge bg-light text-dark border">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                            {item.services.length > 4 && (
                                                                <span className="badge bg-secondary text-white">
                                                                    +{item.services.length - 4} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">None</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        {/* Circle Scope Select Dropdown - Placed BEFORE Special Setting */}
                                                        <select
                                                            className="form-select form-select-sm shadow-sm border"
                                                            value={item.circle || 'ALL'}
                                                            onChange={(e) => handleUpdateCircle(item.id, e.target.value)}
                                                            style={{
                                                                width: 'auto',
                                                                fontSize: '0.75rem',
                                                                borderRadius: '6px',
                                                                fontWeight: '600',
                                                                backgroundColor: item.circle && item.circle !== 'ALL' ? '#eff6ff' : '#ffffff',
                                                                borderColor: item.circle && item.circle !== 'ALL' ? '#3b82f6' : '#cbd5e1',
                                                                color: item.circle && item.circle !== 'ALL' ? '#1d4ed8' : '#374151',
                                                                cursor: 'pointer',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px'
                                                            }}
                                                            title="Select Circle / State Scope for this API"
                                                        >
                                                            <option value="ALL">🌐 ALL STATES</option>
                                                            {(utilityCircles.length > 0 ? utilityCircles : fallbackCircles).map((c) => (
                                                                <option key={c.id || c.name} value={c.name}>
                                                                    📍 {c.name}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <button
                                                            type="button"
                                                            onClick={() => setSpecialModal({ show: true, item: item })}
                                                            className="btn btn-sm text-white d-inline-flex align-items-center justify-content-center px-2 py-1"
                                                            style={{ backgroundColor: '#f59e0b', borderRadius: '6px', fontSize: '0.75rem' }}
                                                            title="Special Setting (Plan Rules)"
                                                        >
                                                            <i className="fas fa-sliders-h me-1"></i> Special Setting
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/api-master/setting/edit/${item.id}`)}
                                                            className="btn btn-sm text-white d-inline-flex align-items-center justify-content-center p-2"
                                                            style={{ backgroundColor: '#6366f1', borderRadius: '6px', width: '32px', height: '32px' }}
                                                            title="Edit API"
                                                        >
                                                            <i className="fas fa-pencil-alt" style={{ fontSize: '0.8rem' }}></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteModal({ show: true, id: item.id, name: item.api_name })}
                                                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-2"
                                                            style={{ borderRadius: '6px', width: '32px', height: '32px' }}
                                                            title="Delete API"
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
                </div>
            </div>

            {/* Special Settings Modal */}
            <ApiSpecialSettingModal
                show={specialModal.show}
                apiItem={specialModal.item}
                onClose={() => setSpecialModal({ show: false, item: null })}
            />

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-danger">Delete API Master</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                                ></button>
                            </div>
                            <div className="modal-body py-4">
                                <p className="mb-0 text-secondary">
                                    Are you sure you want to delete API configuration <strong className="text-dark">{deleteModal.name}</strong>?
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

export default ApiSettingReport;

