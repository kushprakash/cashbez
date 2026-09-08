import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OperatorMapping = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    const [apis, setApis] = useState([]);
    const [categories, setCategories] = useState([]);

    const [selectedApi, setSelectedApi] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [operators, setOperators] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingOperators, setLoadingOperators] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch initial API & Category options on mount
    useEffect(() => {
        fetchOptions();
    }, []);

    // Re-fetch operators whenever selected API or Category changes
    useEffect(() => {
        if (selectedApi) {
            fetchOperators();
        } else {
            setOperators([]);
        }
    }, [selectedApi, selectedCategory]);

    const fetchOptions = async () => {
        setLoadingOptions(true);
        try {
            const response = await apiService.vGet('/api/operator-mappings/options');
            if (response.data && response.data.status === 1) {
                const data = response.data.data;
                const apiList = data.apis || [];
                setApis(apiList);
                setCategories(data.categories || []);

                if (apiList.length > 0) {
                    setSelectedApi(apiList[0].id.toString());
                }
            } else {
                toast.error(response.data?.message || 'Failed to load options');
            }
        } catch (error) {
            toast.error('Error connecting to server for mapping options');
        } finally {
            setLoadingOptions(false);
        }
    };

    const fetchOperators = async () => {
        if (!selectedApi) return;
        setLoadingOperators(true);
        try {
            const response = await apiService.vGet(`/api/operator-mappings/operators?api_id=${selectedApi}&category=${encodeURIComponent(selectedCategory)}`);
            if (response.data && response.data.status === 1) {
                setOperators(response.data.data || []);
            } else {
                toast.error(response.data?.message || 'Failed to load operators');
            }
        } catch (error) {
            toast.error('Error fetching operators for mapping');
        } finally {
            setLoadingOperators(false);
        }
    };

    const handleCodeChange = (index, val) => {
        setOperators(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], api_operator_code: val };
            return updated;
        });
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!selectedApi) {
            toast.warning('Please select an API first');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                api_id: selectedApi,
                category: selectedCategory,
                mappings: operators.map(op => ({
                    utility_operator_id: op.utility_operator_id,
                    operator_code: op.code,
                    category: op.category,
                    api_operator_code: op.api_operator_code || '',
                    mapping_status: op.mapping_status ?? true
                }))
            };

            const response = await apiService.vPost('/api/operator-mappings/save', payload);
            if (response.data && response.data.status === 1) {
                toast.success(response.data.message || 'Operator mappings saved successfully!');
            } else {
                toast.error(response.data?.message || 'Failed to save mappings');
            }
        } catch (error) {
            toast.error('Error saving operator mappings');
        } finally {
            setSaving(false);
        }
    };

    // Filter operators by search query
    const filteredOperators = operators.filter(op => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (op.name && op.name.toLowerCase().includes(q)) ||
            (op.code && op.code.toLowerCase().includes(q)) ||
            (op.category && op.category.toLowerCase().includes(q)) ||
            (op.api_operator_code && op.api_operator_code.toLowerCase().includes(q))
        );
    });

    const selectedApiObj = apis.find(a => a.id.toString() === selectedApi.toString());

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header / Breadcrumb */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ color: '#4b5563', fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Apis / </span>
                        <span className="text-secondary fw-bold">Operator Mapping</span>
                    </h5>
                    <small className="text-muted">
                        Map provider-specific operator codes to fixed internal operators
                    </small>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/api-master/setting/report')}
                        className="btn px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#6c5ce7',
                            borderColor: '#6c5ce7',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-list"></i> API REPORT
                    </button>
                </div>
            </div>

            {/* Top Card: API & Category Selection Filters */}
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                        <i className="fas fa-sitemap text-primary"></i> Select API & Category
                    </h6>
                    {selectedApiObj && (
                        <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-2 rounded-pill" style={{ fontSize: '0.8rem' }}>
                            Selected API: {selectedApiObj.api_name} ({selectedApiObj.api_short_name})
                        </span>
                    )}
                </div>

                <div className="card-body p-4">
                    <div className="row g-4 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label text-secondary small fw-medium">
                                Select API <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select form-select-lg"
                                value={selectedApi}
                                onChange={(e) => setSelectedApi(e.target.value)}
                                disabled={loadingOptions}
                                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                            >
                                <option value="">-- Choose API --</option>
                                {apis.map(api => (
                                    <option key={api.id} value={api.id}>
                                        {api.api_name} ({api.api_short_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label text-secondary small fw-medium">
                                Select Operator Category
                            </label>
                            <select
                                className="form-select form-select-lg"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                disabled={loadingOptions}
                                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id || cat.category} value={cat.category || cat.name}>
                                        {cat.name || cat.label || cat.category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label text-secondary small fw-medium">
                                Filter / Search Operator
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control form-control-lg border-start-0"
                                    placeholder="Search by name, code, etc..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ borderRadius: '0 8px 8px 0', fontSize: '0.875rem' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Card: Operator Mapping Table */}
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
                            Fixed Operators & Provider Codes
                        </h6>
                        <small className="text-muted">
                            Showing {filteredOperators.length} operator{filteredOperators.length !== 1 ? 's' : ''}
                        </small>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !selectedApi || filteredOperators.length === 0}
                        className="btn text-white fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#6366f1',
                            borderColor: '#6366f1',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                SAVING...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i> SAVE MAPPINGS
                            </>
                        )}
                    </button>
                </div>

                <div className="card-body p-4">
                    {!selectedApi ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-hand-pointer fa-2x mb-3 text-secondary opacity-50"></i>
                            <h6>Please select an API from the dropdown above to manage operator mappings.</h6>
                        </div>
                    ) : loadingOperators ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading operators...</span>
                            </div>
                            <div className="text-muted mt-2 small">Loading operators...</div>
                        </div>
                    ) : filteredOperators.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-inbox fa-2x mb-3 text-secondary opacity-50"></i>
                            <h6>No operators found matching the selected criteria.</h6>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle border mb-0" style={{ fontSize: '0.875rem' }}>
                                <thead className="table-light">
                                    <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        <th className="py-3 px-3 text-center" style={{ width: '60px' }}>SR NO</th>
                                        <th className="py-3 px-3">INTERNAL OPERATOR NAME</th>
                                        <th className="py-3 px-3" style={{ width: '160px' }}>INTERNAL CODE</th>
                                        <th className="py-3 px-3" style={{ width: '180px' }}>CATEGORY</th>
                                        <th className="py-3 px-3" style={{ width: '320px' }}>
                                            MAPPED API OPERATOR CODE <span className="text-danger">*</span>
                                        </th>
                                        <th className="py-3 px-3 text-center" style={{ width: '100px' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOperators.map((op, idx) => (
                                        <tr key={op.utility_operator_id || idx} className="border-bottom">
                                            <td className="py-3 px-3 text-center fw-semibold text-muted">
                                                {idx + 1}
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fw-bold text-dark">{op.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="badge bg-light text-dark border px-2 py-1 font-monospace" style={{ fontSize: '0.8rem' }}>
                                                    {op.code || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="badge bg-info-subtle text-info fw-semibold px-2 py-1" style={{ fontSize: '0.78rem' }}>
                                                    {op.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    className="form-control font-monospace border-primary-subtle"
                                                    placeholder="Enter Provider Code (e.g. VF, AT, JIO)"
                                                    value={op.api_operator_code || ''}
                                                    onChange={(e) => {
                                                        const realIdx = operators.findIndex(o => o.utility_operator_id === op.utility_operator_id);
                                                        if (realIdx !== -1) handleCodeChange(realIdx, e.target.value);
                                                    }}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                />
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className={`badge ${op.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-2 py-1`} style={{ fontSize: '0.75rem' }}>
                                                    {op.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {filteredOperators.length > 0 && (
                    <div className="card-footer bg-white border-top-0 p-4 text-center">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !selectedApi}
                            className="btn text-white fw-bold px-5 py-2 shadow-sm"
                            style={{
                                backgroundColor: '#6366f1',
                                borderColor: '#6366f1',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    SAVING MAPPINGS...
                                </>
                            ) : (
                                'SAVE MAPPINGS'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperatorMapping;
