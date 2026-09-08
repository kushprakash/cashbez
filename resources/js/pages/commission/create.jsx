import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link, useNavigate } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const CommissionCreate = () => {
    const [mainModules, setMainModules] = useState([]);
    const [mainModuleId, setMainModuleId] = useState('');
    const [modules, setModules] = useState([]);
    const [moduleId, setModuleId] = useState('');
    const [subModules, setSubModules] = useState([]);
    const [subModuleId, setSubModuleId] = useState('');
    const [modulesLoading, setModulesLoading] = useState(false);
    const [subModulesLoading, setSubModulesLoading] = useState(false);
    const [mode, setMode] = useState('1');
    const [fromAmt, setFromAmt] = useState('');
    const [toAmt, setToAmt] = useState('');
    const [commissionType, setCommissionType] = useState('1');
    const [commission, setCommission] = useState('');
    const [txnType, setTxnType] = useState('Commission');
    const [status, setStatus] = useState('1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMainModules = async () => {
            try {
                const apiService = ApiService();
                const response = await apiService.vGet('/api/main-modules');
                if (response.data.status === 1) {
                    setMainModules(response.data.modules || []);
                }
            } catch (err) { }
        };
        fetchMainModules();
    }, []);

    useEffect(() => {
        const fetchModules = async () => {
            if (!mainModuleId) {
                setModules([]);
                setModuleId('');
                setSubModules([]);
                setSubModuleId('');
                return;
            }
            setModulesLoading(true);
            try {
                const apiService = ApiService();
                const response = await apiService.vGet(`/api/modules/by-main-module/${mainModuleId}`);
                if (response.data.status === 1) {
                    setModules(response.data.modules || []);
                } else {
                    setModules([]);
                }
                setModuleId('');
                setSubModules([]);
                setSubModuleId('');
            } catch (err) {
                setModules([]);
                setModuleId('');
                setSubModules([]);
                setSubModuleId('');
            } finally {
                setModulesLoading(false);
            }
        };
        fetchModules();
    }, [mainModuleId]);

    useEffect(() => {
        const fetchSubModules = async () => {
            if (!moduleId) {
                setSubModules([]);
                setSubModuleId('');
                return;
            }
            setSubModulesLoading(true);
            try {
                const apiService = ApiService();
                const response = await apiService.vGet(`/api/sub_modules_by_id?module_id=${moduleId}`);
                if (response.data.status === 1) {
                    setSubModules(response.data.modules || []);
                } else {
                    setSubModules([]);
                }
                setSubModuleId('');
            } catch (err) {
                setSubModules([]);
                setSubModuleId('');
            } finally {
                setSubModulesLoading(false);
            }
        };
        fetchSubModules();
    }, [moduleId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const formData = new FormData();
            formData.append('main_module_id', mainModuleId);
            formData.append('module_id', moduleId);
            formData.append('sub_module_id', subModuleId);
            formData.append('mode', mode);
            formData.append('from_amt', fromAmt);
            formData.append('to_amt', toAmt);
            formData.append('commission_type', commissionType);
            formData.append('commission', commission);
            formData.append('txn_type', txnType);
            formData.append('status', status);
            const apiService = ApiService();
            const response = await apiService.vPost('/api/module-commissions', formData, true, true);
            if (response.data.status !== 1) {
                throw new Error(response.data.message || 'Failed to create commission');
            }
            setSuccess(true);
            setMainModuleId('');
            setModuleId('');
            setSubModuleId('');
            setMode('1');
            setFromAmt('');
            setToAmt('');
            setCommissionType('1');
            setCommission('');
            setTxnType('Commission');
            setStatus('1');
            //setTimeout(() => navigate('/commission/list'), 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Pageheader mainheading="Commission Master" parentfolder="Commissions" activepage="Create" />
            <div className="page-content-box">
            <div className="page-content-box-inner">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                <span className="d-flex align-items-center">
                                    <i className="bi bi-cash-coin me-2" style={{ fontSize: '1.3rem' }}></i>
                                    <h5 className="mb-0 fw-semibold">Add Commission/Charge</h5>
                                </span>
                                <Link to="/commission/list" className="btn btn-primary text-white d-flex align-items-center">
                                    <i className="fa fa-list me-1"></i> Commission/Charge List
                                </Link>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit} className='row g-3'>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="mainModuleId" className="form-label">Main Module</label>
                                        <select id="mainModuleId" className="form-select" value={mainModuleId} onChange={e => setMainModuleId(e.target.value)} required>
                                            <option value="">Select Main Module</option>
                                            {mainModules.map(mainModule => (
                                                <option key={mainModule.id} value={mainModule.id}>{mainModule.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="moduleId" className="form-label">Module</label>
                                        <select id="moduleId" className="form-select" value={moduleId} onChange={e => setModuleId(e.target.value)} disabled={!mainModuleId || modules.length === 0 || modulesLoading} required>
                                            <option value="">
                                                {modulesLoading
                                                    ? 'Loading...'
                                                    : modules.length === 0
                                                        ? 'No Modules Found'
                                                        : 'Select Module'}
                                            </option>
                                            {modules.map(module => (
                                                <option key={module.id} value={module.id}>{module.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="subModuleId" className="form-label">Sub Module</label>
                                        <select id="subModuleId" className="form-select" value={subModuleId} onChange={e => setSubModuleId(e.target.value)} disabled={!moduleId || subModules.length === 0 || subModulesLoading}>
                                            <option value="">
                                                {subModulesLoading
                                                    ? 'Loading...'
                                                    : subModules.length === 0
                                                        ? 'No Sub Modules Found'
                                                        : 'Select Sub Module'}
                                            </option>
                                            {subModules.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="mode" className="form-label">Mode</label>
                                        <select id="mode" className="form-select" value={mode} onChange={e => setMode(e.target.value)} required>
                                            <option value="1">Slab</option>
                                            <option value="0">Not Slab</option>
                                        </select>
                                    </div>
                                    
                                    {mode === '1' && (
                                        <>
                                            <div className="col-md-3 mb-3">
                                                <label htmlFor="fromAmt" className="form-label">From Amount</label>
                                                <input type="number" id="fromAmt" className="form-control" value={fromAmt} onChange={e => setFromAmt(e.target.value)} required={mode === '1'} />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label htmlFor="toAmt" className="form-label">To Amount</label>
                                                <input type="number" id="toAmt" className="form-control" value={toAmt} onChange={e => setToAmt(e.target.value)} required={mode === '1'} />
                                            </div>
                                        </>
                                    )}
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="commission" className="form-label">Amount</label>
                                        <input type="number" id="commission" className="form-control" value={commission} onChange={e => setCommission(e.target.value)} required />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="commissionType" className="form-label">Frequency</label>
                                        <select id="commissionType" className="form-select" value={commissionType} onChange={e => setCommissionType(e.target.value)} required>
                                            <option value="1">Percentage %</option>
                                            <option value="0">Flat</option>
                                        </select>
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="txnType" className="form-label">Transaction Type</label>
                                        <select id="txnType" className="form-select" value={txnType} onChange={e => setTxnType(e.target.value)} required>
                                            <option value="Commission">Commission</option>
                                            <option value="Charge">Charge</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select id="status" className="form-select" value={status} onChange={e => setStatus(e.target.value)} required>
                                            <option value="1">Active</option>
                                            <option value="0">Not Active</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 text-white" disabled={loading}>
                                        {loading ? 'Creating...' : <><i className="bi bi-plus-circle me-1"></i> Create Commission</>}
                                    </button>
                                    {success && <div className="alert alert-success mt-3">Commission created successfully!</div>}
                                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CommissionCreate;
