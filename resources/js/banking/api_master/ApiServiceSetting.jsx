import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ApiServiceSetting = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [apis, setApis] = useState([]);
    const [services, setServices] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiService.vGet('/api/api-service-settings');
            if (response.data && response.data.status === 1) {
                const data = response.data.data;
                setApis(data.apis || []);
                setServices(data.services || []);
            } else {
                toast.error(response.data?.message || 'Failed to load service wise API settings');
            }
        } catch (error) {
            toast.error('Error fetching service wise API settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleProfitOnly = (index) => {
        const updated = [...services];
        updated[index].profit_only = !updated[index].profit_only;
        setServices(updated);
    };

    const handleSelectChange = (index, field, value) => {
        const updated = [...services];
        updated[index][field] = value ? parseInt(value) : null;
        setServices(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await apiService.vPost('/api/api-service-settings', { services });
            if (response.data && response.data.status === 1) {
                toast.success('Service wise API settings saved successfully!');
            } else {
                toast.error(response.data?.message || 'Failed to save settings');
            }
        } catch (error) {
            toast.error('Error saving service wise API settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Breadcrumb & Navigation Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ color: '#4b5563', fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Api Setting / </span>
                        <span className="text-secondary fw-bold">Service Wise Api Setting</span>
                    </h5>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/api-master/setting/report')}
                        className="btn px-3 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#6c5ce7',
                            borderColor: '#6c5ce7',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-list"></i> API MASTER REPORT
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
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="btn px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#10b981',
                            borderColor: '#10b981',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i> SAVE SETTINGS
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Card Content */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2">
                    <h6 className="fw-bold text-secondary mb-0" style={{ fontSize: '1rem', color: '#6b7280' }}>
                        Api Service Setting
                    </h6>
                </div>

                <div className="card-body p-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        <th className="py-3 px-3" style={{ width: '22%' }}>SERVICES</th>
                                        <th className="py-3 px-3" style={{ width: '50%' }}>APIS</th>
                                        <th className="py-3 px-3" style={{ width: '28%' }}>PENDING</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((item, idx) => (
                                        <tr key={item.service_type || idx} className="border-bottom">
                                            {/* SERVICES Column */}
                                            <td className="py-4 px-3 align-top">
                                                <div className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem' }}>
                                                    {item.service_type}
                                                </div>
                                                <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                                                    <input
                                                        className="form-check-input ms-0 me-2"
                                                        type="checkbox"
                                                        role="switch"
                                                        id={`profit_only_${idx}`}
                                                        checked={!!item.profit_only}
                                                        onChange={() => handleToggleProfitOnly(idx)}
                                                        style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                                                    />
                                                    <label
                                                        className="form-check-label text-muted fw-semibold"
                                                        htmlFor={`profit_only_${idx}`}
                                                        style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                                                    >
                                                        Profit Only
                                                    </label>
                                                </div>
                                            </td>

                                            {/* APIS Column (2x2 Grid) */}
                                            <td className="py-3 px-3 align-top">
                                                <div className="row g-3">
                                                    {/* API 1 */}
                                                    <div className="col-md-6">
                                                        <div className="form-floating">
                                                            <select
                                                                className="form-select border-secondary-subtle"
                                                                id={`api_1_${idx}`}
                                                                value={item.api_1 || ''}
                                                                onChange={(e) => handleSelectChange(idx, 'api_1', e.target.value)}
                                                                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                                                            >
                                                                <option value="">Select</option>
                                                                {apis.map((a) => (
                                                                    <option key={a.id} value={a.id}>
                                                                        {a.api_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <label htmlFor={`api_1_${idx}`} className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                                                                API 1
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* API 2 */}
                                                    <div className="col-md-6">
                                                        <div className="form-floating">
                                                            <select
                                                                className="form-select border-secondary-subtle"
                                                                id={`api_2_${idx}`}
                                                                value={item.api_2 || ''}
                                                                onChange={(e) => handleSelectChange(idx, 'api_2', e.target.value)}
                                                                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                                                            >
                                                                <option value="">Select</option>
                                                                {apis.map((a) => (
                                                                    <option key={a.id} value={a.id}>
                                                                        {a.api_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <label htmlFor={`api_2_${idx}`} className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                                                                API 2
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* API 3 */}
                                                    <div className="col-md-6">
                                                        <div className="form-floating">
                                                            <select
                                                                className="form-select border-secondary-subtle"
                                                                id={`api_3_${idx}`}
                                                                value={item.api_3 || ''}
                                                                onChange={(e) => handleSelectChange(idx, 'api_3', e.target.value)}
                                                                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                                                            >
                                                                <option value="">Select</option>
                                                                {apis.map((a) => (
                                                                    <option key={a.id} value={a.id}>
                                                                        {a.api_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <label htmlFor={`api_3_${idx}`} className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                                                                API 3
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* API 4 */}
                                                    <div className="col-md-6">
                                                        <div className="form-floating">
                                                            <select
                                                                className="form-select border-secondary-subtle"
                                                                id={`api_4_${idx}`}
                                                                value={item.api_4 || ''}
                                                                onChange={(e) => handleSelectChange(idx, 'api_4', e.target.value)}
                                                                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                                                            >
                                                                <option value="">Select</option>
                                                                {apis.map((a) => (
                                                                    <option key={a.id} value={a.id}>
                                                                        {a.api_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <label htmlFor={`api_4_${idx}`} className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                                                                API 4
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* PENDING Column */}
                                            <td className="py-3 px-3 align-top">
                                                <div className="d-flex flex-column gap-3">
                                                    {/* Pending API 1 */}
                                                    <div className="form-floating">
                                                        <select
                                                            className="form-select border-secondary-subtle"
                                                            id={`pending_api_1_${idx}`}
                                                            value={item.pending_api_1 || ''}
                                                            onChange={(e) => handleSelectChange(idx, 'pending_api_1', e.target.value)}
                                                            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                                                        >
                                                            <option value="">Select</option>
                                                            {apis.map((a) => (
                                                                <option key={a.id} value={a.id}>
                                                                    {a.api_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <label htmlFor={`pending_api_1_${idx}`} className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                                                            Pending API 1
                                                        </label>
                                                    </div>

                                                    {/* Pending API 2 */}
                                                    <div className="form-floating">
                                                        <select
                                                            className="form-select border-secondary-subtle"
                                                            id={`pending_api_2_${idx}`}
                                                            value={item.pending_api_2 || ''}
                                                            onChange={(e) => handleSelectChange(idx, 'pending_api_2', e.target.value)}
                                                            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                                                        >
                                                            <option value="">Select</option>
                                                            {apis.map((a) => (
                                                                <option key={a.id} value={a.id}>
                                                                    {a.api_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <label htmlFor={`pending_api_2_${idx}`} className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                                                            Pending API 2
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiServiceSetting;
