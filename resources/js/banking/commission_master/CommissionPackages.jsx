import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultOperators = ['ALL', 'JIO', 'AIRTEL', 'VI', 'BSNL'];

const isOperatorWiseCategory = (categoryName) => {
    if (!categoryName) return false;
    const catUpper = categoryName.toUpperCase().trim();
    return (
        catUpper.includes('PREPAID') ||
        catUpper.includes('POSTPAID') ||
        catUpper.includes('DTH') ||
        catUpper.includes('INSURANCE')
    );
};

const CommissionPackages = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    const [packages, setPackages] = useState([]);
    const [apis, setApis] = useState([]);
    const [categories, setCategories] = useState(['Prepaid', 'Postpaid', 'DTH', 'Electricity', 'Water', 'Gas', 'Landline', 'Broadband', 'Insurance', 'FASTag']);
    const [categoryOperators, setCategoryOperators] = useState({});
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Modal Form state
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [packageName, setPackageName] = useState('');
    const [selectedApiId, setSelectedApiId] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Accordion State
    const [expandedCategory, setExpandedCategory] = useState('Prepaid');

    // Matrix items: { [category-operator]: { commission_type: 'percentage'|'flat', commission_val: number } }
    const [itemsMatrix, setItemsMatrix] = useState({});

    const toggleCategory = (cat) => {
        setExpandedCategory(prev => prev === cat ? null : cat);
    };

    const getOperatorsForCategory = (cat) => {
        if (categoryOperators[cat] && Array.isArray(categoryOperators[cat]) && categoryOperators[cat].length > 0) {
            return categoryOperators[cat];
        }
        if (isOperatorWiseCategory(cat)) {
            return defaultOperators.map(o => ({ code: o, name: o }));
        }
        return [{ code: 'ALL', name: 'ALL' }];
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pkgRes, catRes, apiRes, opRes] = await Promise.all([
                apiService.vGet(`/api/commission-master/packages?search=${encodeURIComponent(search)}`),
                apiService.vGet('/api/service-categories'),
                apiService.vGet('/api/api-pending-settings?service_type=Prepaid'),
                apiService.vGet('/api/commission-master/category-operators')
            ]);

            if (pkgRes.data && pkgRes.data.status === 1) {
                setPackages(pkgRes.data.data || []);
            }
            if (catRes.data && catRes.data.status === 1 && Array.isArray(catRes.data.data)) {
                setCategories(catRes.data.data);
            }
            if (apiRes.data && apiRes.data.status === 1 && apiRes.data.data?.apis) {
                setApis(apiRes.data.data.apis);
            }
            if (opRes.data && opRes.data.status === 1) {
                setCategoryOperators(opRes.data.data || {});
            }
        } catch (error) {
            toast.error('Error loading packages data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search]);

    const openCreateModal = () => {
        setEditId(null);
        setPackageName('');
        setSelectedApiId('');
        setDescription('');
        setExpandedCategory(categories[0] || 'Prepaid');
        
        // Initialize matrix with defaults using dynamic operators per category
        const initial = {};
        categories.forEach(cat => {
            const opsList = getOperatorsForCategory(cat);
            opsList.forEach(op => {
                const opCode = typeof op === 'string' ? op : op.code;
                initial[`${cat}-${opCode}`] = { commission_type: 'percentage', commission_val: 0 };
            });
        });
        setItemsMatrix(initial);
        setShowModal(true);
    };

    const openEditModal = (pkg) => {
        setEditId(pkg.id);
        setPackageName(pkg.name);
        setSelectedApiId(pkg.api_id || '');
        setDescription(pkg.description || '');
        setExpandedCategory(categories[0] || 'Prepaid');

        const matrix = {};
        categories.forEach(cat => {
            const opsList = getOperatorsForCategory(cat);
            opsList.forEach(op => {
                const opCode = typeof op === 'string' ? op : op.code;
                matrix[`${cat}-${opCode}`] = { commission_type: 'percentage', commission_val: 0 };
            });
        });

        if (Array.isArray(pkg.items)) {
            pkg.items.forEach(it => {
                const key = `${it.category}-${it.operator_code}`;
                matrix[key] = {
                    commission_type: it.commission_type || 'percentage',
                    commission_val: it.commission_val || 0
                };
            });
        }

        setItemsMatrix(matrix);
        setShowModal(true);
    };

    const handleMatrixChange = (cat, op, field, val) => {
        const key = `${cat}-${op}`;
        setItemsMatrix(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: field === 'commission_val' ? parseFloat(val) || 0 : val
            }
        }));
    };

    const handleSavePackage = async (e) => {
        e.preventDefault();
        if (!packageName.trim()) {
            toast.warning('Please enter package name');
            return;
        }

        setSaving(true);
        try {
            // Build items array from matrix
            const items = [];
            Object.keys(itemsMatrix).forEach(key => {
                const [cat, op] = key.split('-');
                const data = itemsMatrix[key];
                if (data.commission_val > 0) {
                    items.push({
                        category: cat,
                        operator_code: op,
                        commission_type: data.commission_type,
                        commission_val: data.commission_val
                    });
                }
            });

            const payload = {
                name: packageName,
                api_id: selectedApiId || null,
                description: description,
                items: items
            };

            const response = editId
                ? await apiService.vPut(`/api/commission-master/packages/${editId}`, payload)
                : await apiService.vPost('/api/commission-master/packages', payload);

            if (response.data && response.data.status === 1) {
                toast.success(editId ? 'Package updated successfully' : 'Package created successfully');
                setShowModal(false);
                fetchData();
            } else {
                toast.error(response.data?.message || 'Failed to save package');
            }
        } catch (error) {
            toast.error('Error saving package');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (pkgId) => {
        try {
            const response = await apiService.vPost(`/api/commission-master/packages/${pkgId}/toggle-status`, {});
            if (response.data && response.data.status === 1) {
                toast.success('Package status updated');
                fetchData();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Error toggling package status');
        }
    };

    const handleDeletePackage = async (pkgId) => {
        if (!window.confirm('Are you sure you want to delete this package?')) return;
        try {
            const response = await apiService.vDelete(`/api/commission-master/packages/${pkgId}`);
            if (response.data && response.data.status === 1) {
                toast.success('Package deleted');
                fetchData();
            } else {
                toast.error('Failed to delete package');
            }
        } catch (error) {
            toast.error('Error deleting package');
        }
    };

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Commission Master / </span>
                        <span className="text-secondary fw-bold">Commission Packages</span>
                    </h5>
                    <p className="text-secondary small mb-0">Create and manage API & Operator-wise Commission Packages</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/commission-master/assignments')}
                        className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-semibold"
                    >
                        <i className="fas fa-user-tag me-1"></i> Package Assignments
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/commission-master/special-offers')}
                        className="btn btn-sm btn-outline-warning rounded-3 px-3 fw-semibold"
                    >
                        <i className="fas fa-gift me-1"></i> Special Offers
                    </button>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="btn btn-sm text-white fw-bold px-3 rounded-3"
                        style={{ backgroundColor: '#6366f1', borderColor: '#6366f1' }}
                    >
                        <i className="fas fa-plus me-1"></i> + ADD PACKAGE
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    {/* Controls */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-secondary small fw-medium">Search Package:</span>
                            <input
                                type="text"
                                className="form-control form-control-sm rounded-3"
                                placeholder="Search by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: '250px' }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 border" style={{ fontSize: '0.85rem' }}>
                            <thead className="bg-light">
                                <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                    <th className="py-3 px-3">SR NO</th>
                                    <th className="py-3 px-3">PACKAGE NAME</th>
                                    <th className="py-3 px-3">API SCOPE</th>
                                    <th className="py-3 px-3">CONFIGURED RATES</th>
                                    <th className="py-3 px-3 text-center">STATUS</th>
                                    <th className="py-3 px-3 text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : packages.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            No Commission Packages configured yet. Click "+ ADD PACKAGE" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    packages.map((pkg, idx) => (
                                        <tr key={pkg.id}>
                                            <td className="py-3 px-3 text-secondary">{idx + 1}</td>
                                            <td className="py-3 px-3 fw-bold text-dark">{pkg.name}</td>
                                            <td className="py-3 px-3">
                                                {pkg.api ? (
                                                    <span className="badge bg-primary-subtle text-primary border border-primary fw-bold">
                                                        {pkg.api.api_name || pkg.api.api_short_name}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-success-subtle text-success border border-success fw-bold">
                                                        🌐 ALL APIs
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-secondary">
                                                <span className="badge bg-secondary-subtle text-dark border">
                                                    {pkg.items?.length || 0} Rate Rules Configured
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(pkg.id)}
                                                    className={`btn btn-sm px-3 rounded-pill text-white fw-semibold ${pkg.is_active ? 'bg-success' : 'bg-secondary'}`}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    {pkg.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(pkg)}
                                                        className="btn btn-sm btn-outline-primary border-0 p-1"
                                                        title="Edit Package"
                                                    >
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeletePackage(pkg.id)}
                                                        className="btn btn-sm btn-outline-danger border-0 p-1"
                                                        title="Delete Package"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
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

            {/* Create/Edit Package Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-bottom px-4 py-3 bg-light rounded-top-4">
                                <h5 className="modal-title fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                    {editId ? 'Edit Commission Package' : 'Create New Commission Package'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSavePackage}>
                                <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                    {/* Package Info Inputs */}
                                    <div className="row g-3 mb-4 p-3 bg-light rounded-3 border">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-secondary mb-1">Package Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3"
                                                placeholder="e.g. Retailer Master Package"
                                                value={packageName}
                                                onChange={(e) => setPackageName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-secondary mb-1">Apply to Specific API (Optional)</label>
                                            <select
                                                className="form-select form-select-sm rounded-3"
                                                value={selectedApiId}
                                                onChange={(e) => setSelectedApiId(e.target.value)}
                                            >
                                                <option value="">🌐 ALL APIs (Default)</option>
                                                {apis.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.api_name || a.api_short_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label small fw-semibold text-secondary mb-1">Description / Notes</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3"
                                                placeholder="Optional notes for this commission package"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Category & Operator Commission Matrix */}
                                    <h6 className="fw-bold text-dark mb-3 small text-uppercase">
                                        <i className="fas fa-percentage text-primary me-1"></i> Category & Dynamic Operator Commission Matrix
                                    </h6>

                                    <div className="mb-2">
                                        {categories.map((cat) => {
                                            const isExpanded = expandedCategory === cat;
                                            const isOpWise = isOperatorWiseCategory(cat);
                                            const activeOperators = getOperatorsForCategory(cat);

                                            return (
                                                <div className="border rounded-3 mb-2 overflow-hidden bg-white shadow-sm" key={cat}>
                                                    <button
                                                        type="button"
                                                        className="w-100 d-flex justify-content-between align-items-center py-2.5 px-3 bg-light border-0 fw-bold text-dark text-start"
                                                        onClick={() => toggleCategory(cat)}
                                                        style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span>{cat} Service Rates</span>
                                                            {!isOpWise && (
                                                                <span className="badge bg-secondary-subtle text-secondary border" style={{ fontSize: '0.65rem' }}>
                                                                    Category-Wise Commission
                                                                </span>
                                                            )}
                                                            {isOpWise && (
                                                                <span className="badge bg-info-subtle text-info border" style={{ fontSize: '0.65rem' }}>
                                                                    Dynamic Operators ({activeOperators.length})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <i className={`fas ${isExpanded ? 'fa-chevron-up text-primary' : 'fa-chevron-down text-secondary'}`}></i>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="p-3 border-top bg-white">
                                                            <div className="row g-3">
                                                                {activeOperators.map((opObj) => {
                                                                    const opCode = typeof opObj === 'string' ? opObj : opObj.code;
                                                                    const opName = typeof opObj === 'string' ? opObj : (opObj.name || opObj.code);
                                                                    const key = `${cat}-${opCode}`;
                                                                    const current = itemsMatrix[key] || { commission_type: 'percentage', commission_val: 0 };

                                                                    return (
                                                                        <div key={opCode} className={isOpWise ? "col-md-4 col-sm-6" : "col-md-6 col-12"}>
                                                                            <div className="p-2 border rounded-3 bg-white shadow-sm">
                                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                                    <span className="fw-bold text-secondary small">
                                                                                        {opCode === 'ALL' && !isOpWise ? `${cat} Rate (All Operators)` : opName}
                                                                                    </span>
                                                                                    <span className="badge bg-light text-dark border" style={{ fontSize: '0.65rem' }}>{cat}</span>
                                                                                </div>
                                                                                <div className="input-group input-group-sm">
                                                                                    <select
                                                                                        className="form-select form-select-sm"
                                                                                        value={current.commission_type}
                                                                                        onChange={(e) => handleMatrixChange(cat, opCode, 'commission_type', e.target.value)}
                                                                                        style={{ maxWidth: '110px' }}
                                                                                    >
                                                                                        <option value="percentage">Percentage (%)</option>
                                                                                        <option value="flat">Flat (₹)</option>
                                                                                    </select>
                                                                                    <input
                                                                                        type="number"
                                                                                        step="0.01"
                                                                                        min="0"
                                                                                        className="form-control form-control-sm text-end fw-bold text-success"
                                                                                        placeholder="0.00"
                                                                                        value={current.commission_val}
                                                                                        onChange={(e) => handleMatrixChange(cat, opCode, 'commission_val', e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="modal-footer border-top py-2 px-4">
                                    <button type="button" className="btn btn-secondary px-4 rounded-3" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn text-white fw-bold px-4 rounded-3"
                                        style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                    >
                                        <i className="fas fa-save me-1"></i> {saving ? 'Saving...' : 'SAVE PACKAGE'}
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

export default CommissionPackages;
