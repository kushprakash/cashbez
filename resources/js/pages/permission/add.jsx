import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const AddPermission = () => {
    const [mainModules, setMainModules] = useState([]);
    const [selectedMainModule, setSelectedMainModule] = useState('');
    const [modules, setModules] = useState([]);
    const [moduleId, setModuleId] = useState('');
    const [subModules, setSubModules] = useState([]);
    const [subModuleId, setSubModuleId] = useState('');
    const [name, setName] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [route, setRoute] = useState('');
    const [status, setStatus] = useState('1');
    const [menuShow, setMenuShow] = useState('1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchMainModules = async () => {
            try {
                const apiService = ApiService();
                const response = await apiService.vGet('/api/main-modules');
                const { data } = response;
                if (data.status === 1) {
                    setMainModules(data.modules || []);
                }
            } catch (err) {
                // ignore
            }
        };
        fetchMainModules();
    }, []);

    const fetchModulesByMainModule = async (mainModuleId) => {
        try {
            const apiService = ApiService();
            const response = await apiService.vGet(`/api/modules/by-main-module/${mainModuleId}`);
            const { data } = response;
            if (data.status === 1) {
                setModules(data.modules || []);
            } else {
                setModules([]);
            }
        } catch (err) {
            setModules([]);
        }
    };

    const handleMainModuleChange = (e) => {
        const mainModuleId = e.target.value;
        setSelectedMainModule(mainModuleId);
        setModuleId(''); // Reset module selection
        setSubModules([]);
        setSubModuleId(''); // Reset sub module selection
        if (mainModuleId) {
            fetchModulesByMainModule(mainModuleId);
        } else {
            setModules([]);
        }
    };

    useEffect(() => {
        const fetchSubModules = async () => {
            if (!moduleId) {
                setSubModules([]);
                setSubModuleId('');
                return;
            }
            try {
                const apiService = ApiService();
                const response = await apiService.vGet(`/api/sub_modules_by_id?module_id=${moduleId}`);
                const { data } = response;
                if (data.status === 1) {
                    setSubModules(data.modules || []);
                } else {
                    setSubModules([]);
                }
                setSubModuleId(''); // Reset sub module selection when module changes
            } catch (err) {
                setSubModules([]);
                setSubModuleId('');
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
            formData.append('main_module_id', selectedMainModule);
            formData.append('module_id', moduleId);
            formData.append('sub_module_id', subModuleId);
            formData.append('name', name);
            formData.append('endpoint', endpoint);
            formData.append('route', route);
            formData.append('status', status);
            formData.append('menu_show', menuShow);
            const apiService = ApiService();
            const response = await apiService.vPost('/api/module-permissions', formData, true, true);
            const { data } = response;
            if (data.status !== 1) {
                throw new Error(data.message || 'Failed to create permission');
            }
            setSuccess(true);
            setSelectedMainModule('');
            setModules([]);
            setModuleId('');
            setSubModules([]);
            setSubModuleId('');
            setName('');
            setEndpoint('');
            setRoute('');
            setStatus('1');
            setMenuShow('1');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Pageheader mainheading="Permission Master" parentfolder="Permissions" activepage="Create" />
            <div className="page-content-box">
            <div className="page-content-box-inner">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                <span className="d-flex align-items-center">
                                    <i className="bi bi-shield-lock me-2" style={{ fontSize: '1.3rem' }}></i>
                                    <h5 className="mb-0 fw-semibold">Add Permission</h5>
                                </span>
                                <Link to="/permission/list" className="btn btn-primary text-white d-flex align-items-center">
                                    <i className="fa fa-list me-1"></i> Permission List
                                </Link>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit} className='row'>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="mainModuleId" className="form-label">Main Module</label>
                                        <select
                                            id="mainModuleId"
                                            className="form-select"
                                            value={selectedMainModule}
                                            onChange={handleMainModuleChange}
                                            required
                                        >
                                            <option value="">Select Main Module</option>
                                            {mainModules.map(module => (
                                                <option key={module.id} value={module.id}>{module.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="moduleId" className="form-label">Module</label>
                                        <select
                                            id="moduleId"
                                            className="form-select"
                                            value={moduleId}
                                            onChange={e => setModuleId(e.target.value)}
                                            required
                                            disabled={!selectedMainModule || modules.length === 0}
                                        >
                                            <option value="">{modules.length === 0 ? 'No Modules Found' : 'Select Module'}</option>
                                            {modules.map(module => (
                                                <option key={module.id} value={module.id}>{module.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="subModuleId" className="form-label">Sub Module</label>
                                        <select
                                            id="subModuleId"
                                            className="form-select"
                                            value={subModuleId}
                                            onChange={e => setSubModuleId(e.target.value)}
                                            required
                                            disabled={!moduleId || subModules.length === 0}
                                        >
                                            <option value="">{subModules.length === 0 ? 'No Sub Modules Found' : 'Select Sub Module'}</option>
                                            {subModules.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="name" className="form-label">Permission Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="form-control"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="endpoint" className="form-label">API Endpoint</label>
                                        <input
                                            type="text"
                                            id="endpoint"
                                            className="form-control"
                                            value={endpoint}
                                            onChange={e => setEndpoint(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="route" className="form-label">Web Route</label>
                                        <input
                                            type="text"
                                            id="route"
                                            className="form-control"
                                            value={route}
                                            onChange={e => setRoute(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select
                                            id="status"
                                            className="form-select"
                                            value={status}
                                            onChange={e => setStatus(e.target.value)}
                                            required
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Not Active</option>
                                        </select>
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label className="form-label">Menu Show</label>
                                        <div className="d-flex gap-3 align-items-center mt-2">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="menuShow"
                                                    id="menuShowTrue"
                                                    value="1"
                                                    checked={menuShow === '1'}
                                                    onChange={e => setMenuShow(e.target.value)}
                                                />
                                                <label className="form-check-label" htmlFor="menuShowTrue">
                                                    True
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="menuShow"
                                                    id="menuShowFalse"
                                                    value="0"
                                                    checked={menuShow === '0'}
                                                    onChange={e => setMenuShow(e.target.value)}
                                                />
                                                <label className="form-check-label" htmlFor="menuShowFalse">
                                                    False
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 text-white" disabled={loading}>
                                        {loading ? 'Creating...' : <><i className="bi bi-plus-circle me-1"></i> Create Permission</>}
                                    </button>
                                    {success && <div className="alert alert-success mt-3">Permission created successfully!</div>}
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

export default AddPermission;
