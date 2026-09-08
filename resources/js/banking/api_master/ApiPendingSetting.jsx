import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const ApiPendingSetting = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    const [serviceType, setServiceType] = useState('Prepaid');
    const [serviceCategories, setServiceCategories] = useState([
        'Prepaid', 'Postpaid', 'DTH', 'Electricity', 'Landline', 'Water', 'Gas', 
        'Broadband', 'Insurance', 'FASTag', 'Loan Repayment', 'Cable TV', 
        'Municipal Tax', 'Housing Society', 'Hospital', 'Credit Card'
    ]);
    const [apis, setApis] = useState([]);
    const [operators, setOperators] = useState([
        { code: 'JIO', name: 'JIO' },
        { code: 'AIRTEL', name: 'AIRTEL' },
        { code: 'VI', name: 'VI' },
        { code: 'BSNL', name: 'BSNL' }
    ]);
    const [timeFrames, setTimeFrames] = useState(['7AM- 12PM', '5PM- 10PM', 'OTHER']);
    const [matrix, setMatrix] = useState({});
    const [utilityCircles, setUtilityCircles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

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

    const fetchPendingSettings = async (selectedService = serviceType) => {
        setLoading(true);
        try {
            const response = await apiService.vGet(`/api/api-pending-settings?service_type=${encodeURIComponent(selectedService)}`);
            if (response.data && response.data.status === 1) {
                const { apis: apiList, operators: opList, time_frames: tfList, matrix: matrixData, service_categories: catList } = response.data.data;
                setApis(apiList || []);
                if (catList && catList.length > 0) setServiceCategories(catList);
                if (opList && opList.length > 0) setOperators(opList);
                if (tfList && tfList.length > 0) setTimeFrames(tfList);
                setMatrix(matrixData || {});
            } else {
                toast.error(response.data?.message || 'Failed to load pending API settings');
            }
        } catch (error) {
            toast.error('Error fetching pending API settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCircles();
        fetchPendingSettings(serviceType);
    }, [serviceType]);

    const handleUpdateCircle = async (apiId, selectedCircle) => {
        try {
            const response = await apiService.vPost(`/api/api-settings/${apiId}/circle`, { circle: selectedCircle });
            if (response.data && response.data.status === 1) {
                toast.success(`API Circle updated to ${selectedCircle}`);
                fetchPendingSettings(serviceType);
            } else {
                toast.error(response.data?.message || 'Failed to update API Circle');
            }
        } catch (error) {
            toast.error('Error updating API Circle');
        }
    };

    const handleInputChange = (apiId, opCode, timeFrame, value) => {
        const val = parseInt(value, 10);
        const numVal = isNaN(val) || val < 0 ? 0 : val;

        setMatrix((prev) => {
            const newMatrix = { ...prev };
            if (!newMatrix[apiId]) newMatrix[apiId] = {};
            if (!newMatrix[apiId][opCode]) newMatrix[apiId][opCode] = {};

            const cleanTf = timeFrame;
            newMatrix[apiId][opCode][cleanTf] = numVal;

            return newMatrix;
        });
    };

    const getCellValue = (apiId, opCode, timeFrame) => {
        if (matrix[apiId] && matrix[apiId][opCode]) {
            if (matrix[apiId][opCode][timeFrame] !== undefined) {
                return matrix[apiId][opCode][timeFrame];
            }
            // fallback without space
            const noSpaceTf = timeFrame.replace(/\s+/g, '');
            if (matrix[apiId][opCode][noSpaceTf] !== undefined) {
                return matrix[apiId][opCode][noSpaceTf];
            }
        }
        return 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await apiService.vPost('/api/api-pending-settings', {
                service_type: serviceType,
                matrix: matrix
            });

            if (response.data && response.data.status === 1) {
                toast.success('Pending API Settings saved successfully');
            } else {
                toast.error(response.data?.message || 'Failed to save settings');
            }
        } catch (error) {
            toast.error('Error saving pending API settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm(`Are you sure you want to reset all pending settings for ${serviceType}?`)) return;

        setSaving(true);
        try {
            const response = await apiService.vPost('/api/api-pending-settings/reset', {
                service_type: serviceType
            });

            if (response.data && response.data.status === 1) {
                toast.success('Pending API Settings reset successfully');
                setMatrix({});
            } else {
                toast.error(response.data?.message || 'Failed to reset settings');
            }
        } catch (error) {
            toast.error('Error resetting pending API settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Breadcrumb Header */}
            <div className="d-flex justify-content-between align-items-center mb-3 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#4b5563', fontSize: '1.15rem' }}>
                        <span className="text-muted fw-normal">Api Setting / </span>
                        <span className="fw-bold" style={{ color: '#4f46e5' }}>Pending Api Setting</span>
                    </h5>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/api-master/setting/report')}
                        className="btn btn-outline-secondary px-3 py-2 btn-sm rounded-3 d-inline-flex align-items-center gap-2"
                    >
                        <i className="fas fa-arrow-left"></i> Back to Reports
                    </button>
                </div>
            </div>

            {/* Main Card container */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2">
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                        Api Pending Setting
                    </h5>
                </div>

                <div className="card-body p-4 pt-2">
                    {/* Filter dropdown for Service Type */}
                    <div className="d-flex justify-content-center mb-4">
                        <div style={{ width: '280px' }}>
                            <fieldset className="border rounded-3 p-2 bg-light">
                                <legend className="float-none w-auto px-2 small text-secondary fw-semibold mb-0" style={{ fontSize: '0.75rem' }}>
                                    Service Type
                                </legend>
                                <select
                                    className="form-select border-0 bg-transparent shadow-none fw-semibold text-dark py-1"
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                >
                                    {serviceCategories.map((cat, idx) => (
                                        <option key={idx} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted small">Loading API settings matrix...</p>
                        </div>
                    ) : apis.length === 0 ? (
                        <div className="text-center py-5 text-muted fw-medium">
                            <i className="fas fa-exclamation-circle text-warning fs-4 d-block mb-2"></i>
                            No APIs configured for <strong className="text-dark">"{serviceType}"</strong> service. <br />
                            Please assign this service to an API in <span className="text-primary fw-bold cursor-pointer" onClick={() => navigate('/api-master/setting/report')}>API Master Settings</span>.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="table-responsive" style={{ maxHeight: '600px' }}>
                                <table className="table table-bordered align-middle text-center mb-0" style={{ fontSize: '0.82rem', borderColor: '#e5e7eb' }}>
                                    <thead>
                                        {operators.length === 1 && (operators[0].code === 'ALL' || operators[0].name === 'ALL') ? (
                                            <>
                                                <tr className="bg-light text-secondary text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
                                                    <th rowSpan="2" className="align-middle bg-white border-end text-uppercase text-secondary px-3" style={{ minWidth: '160px', width: '160px' }}>
                                                        APIS
                                                    </th>
                                                    <th colSpan={timeFrames.length} className="py-2 text-secondary tracking-wider" style={{ letterSpacing: '1px' }}>
                                                        OPERATORS
                                                    </th>
                                                </tr>
                                                <tr className="bg-light text-secondary" style={{ fontSize: '0.7rem' }}>
                                                    {timeFrames.map((tf, i) => (
                                                        <th key={i} className="py-2 text-muted fw-semibold" style={{ minWidth: '80px' }}>
                                                            {tf}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </>
                                        ) : (
                                            <>
                                                {/* Row 1: OPERATORS Header Spans */}
                                                <tr className="bg-light text-secondary text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
                                                    <th rowSpan="3" className="align-middle bg-white border-end text-uppercase text-secondary px-3" style={{ minWidth: '160px', width: '160px' }}>
                                                        APIS
                                                    </th>
                                                    <th colSpan={operators.length * timeFrames.length} className="py-2 text-secondary tracking-wider" style={{ letterSpacing: '1px' }}>
                                                        OPERATORS
                                                    </th>
                                                </tr>

                                                {/* Row 2: Operator Names */}
                                                <tr className="bg-light text-secondary fw-bold" style={{ fontSize: '0.78rem' }}>
                                                    {operators.map((op) => (
                                                        <th key={op.code} colSpan={timeFrames.length} className="py-2 border-start text-dark text-uppercase">
                                                            {op.name || op.code}
                                                        </th>
                                                    ))}
                                                </tr>

                                                {/* Row 3: Time Frames */}
                                                <tr className="bg-light text-secondary" style={{ fontSize: '0.7rem' }}>
                                                    {operators.map((op) => (
                                                        <React.Fragment key={op.code}>
                                                            {timeFrames.map((tf, i) => (
                                                                <th key={`${op.code}-${i}`} className="py-2 text-muted fw-semibold" style={{ minWidth: '80px' }}>
                                                                    {tf}
                                                                </th>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </tr>
                                            </>
                                        )}
                                    </thead>
                                    <tbody>
                                        {apis.map((api) => (
                                            <tr key={api.id}>
                                                {/* API Name & Circle Selector */}
                                                <td className="fw-bold text-dark text-start px-3 py-3 border-end bg-white" style={{ minWidth: '180px' }}>
                                                    <div className="d-flex flex-column align-items-start gap-1">
                                                        <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{api.api_name || api.api_short_name}</span>
                                                        
                                                        {/* Circle Selector Select Dropdown */}
                                                        <select
                                                            className="form-select form-select-sm shadow-sm border"
                                                            value={api.circle || 'ALL'}
                                                            onChange={(e) => handleUpdateCircle(api.id, e.target.value)}
                                                            style={{
                                                                width: 'auto',
                                                                fontSize: '0.72rem',
                                                                borderRadius: '6px',
                                                                fontWeight: '600',
                                                                backgroundColor: api.circle && api.circle !== 'ALL' ? '#eff6ff' : '#ffffff',
                                                                borderColor: api.circle && api.circle !== 'ALL' ? '#3b82f6' : '#cbd5e1',
                                                                color: api.circle && api.circle !== 'ALL' ? '#1d4ed8' : '#374151',
                                                                cursor: 'pointer',
                                                                paddingTop: '2px',
                                                                paddingBottom: '2px'
                                                            }}
                                                            title="Select State/Circle Scope for this API"
                                                        >
                                                            <option value="ALL">🌐 ALL STATES</option>
                                                            {(utilityCircles.length > 0 ? utilityCircles : fallbackCircles).map((c) => (
                                                                <option key={c.id || c.name} value={c.name}>
                                                                    📍 {c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>

                                                {/* Operator x Timeframe matrix inputs */}
                                                {operators.map((op) => (
                                                    <React.Fragment key={op.code}>
                                                        {timeFrames.map((tf) => {
                                                            const val = getCellValue(api.id, op.code, tf);
                                                            return (
                                                                <td key={`${op.code}-${tf}`} className="p-2 align-middle">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        className="form-control form-control-sm text-center fw-semibold border-0 shadow-none"
                                                                        value={val}
                                                                        onChange={(e) => handleInputChange(api.id, op.code, tf, e.target.value)}
                                                                        style={{
                                                                            backgroundColor: '#e0f7fa',
                                                                            color: '#155e75',
                                                                            borderRadius: '8px',
                                                                            fontSize: '0.9rem',
                                                                            padding: '6px 4px',
                                                                            height: '36px'
                                                                        }}
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Submit & Reset Buttons */}
                            <div className="d-flex justify-content-center gap-3 mt-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn px-5 py-2 text-white fw-bold shadow-sm rounded-3"
                                    style={{
                                        backgroundColor: '#6366f1',
                                        borderColor: '#6366f1',
                                        minWidth: '130px',
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {saving ? 'SAVING...' : 'SUBMIT'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={saving}
                                    className="btn px-5 py-2 text-white fw-bold shadow-sm rounded-3"
                                    style={{
                                        backgroundColor: '#ef4444',
                                        borderColor: '#ef4444',
                                        minWidth: '130px',
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    RESET
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiPendingSetting;
