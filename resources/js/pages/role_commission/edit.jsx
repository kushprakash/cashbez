import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../../core/services/ApiService';
import { useParams, useNavigate } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const EditRoleCommission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [mainModules, setMainModules] = useState([]);
  const [modules, setModules] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [roleId, setRoleId] = useState('');
  const [mainModuleId, setMainModuleId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [subModuleId, setSubModuleId] = useState('');
  const [commissionId, setCommissionId] = useState('');
  const [status, setStatus] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const initialData = useRef({ mainModuleId: '', moduleId: '', subModuleId: '', commissionId: '' });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        const [roleRes, mainModuleRes, moduleRes, itemRes] = await Promise.all([
          apiService.vGet('/api/roles'),
          apiService.vGet('/api/main-modules'),
          apiService.vGet('/api/modules'),
          apiService.vGet(`/api/role-module-commission/${id}`),
        ]);
        if (roleRes.data.status === 1) setRoles(roleRes.data.roles || []);
        if (mainModuleRes.data.status === 1) setMainModules(mainModuleRes.data.modules || []);
        if (moduleRes.data.status === 1) setModules(moduleRes.data.modules || []);
        if (itemRes.data.status === 1) {
          const item = itemRes.data.role_module_commission;
          setRoleId(item.role_id ? String(item.role_id) : '');
          setStatus(item.status !== undefined ? String(item.status) : '1');
          initialData.current = {
            mainModuleId: item.main_module_id ? String(item.main_module_id) : '',
            moduleId: item.module_id ? String(item.module_id) : '',
            subModuleId: item.sub_module_id ? String(item.sub_module_id) : '',
            commissionId: item.commission_id ? String(item.commission_id) : '',
          };
          setMainModuleId(initialData.current.mainModuleId);
          setModuleId(initialData.current.moduleId);
          setInitializing(true);
        } else {
          setError('Failed to load item');
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!mainModuleId) {
      setModules([]);
      setModuleId('');
      setSubModules([]);
      setSubModuleId('');
      setCommissions([]);
      setCommissionId('');
      return;
    }
    const fetchModules = async () => {
      try {
        const apiService = ApiService();
        const res = await apiService.vGet(`/api/modules/by-main-module/${mainModuleId}`);
        if (res.data.status === 1 && Array.isArray(res.data.modules)) {
          setModules(res.data.modules);
        } else {
          setModules([]);
        }
        setSubModules([]);
        setSubModuleId('');
        setCommissions([]);
        setCommissionId('');
        if (initializing && initialData.current.moduleId) {
          setModuleId(initialData.current.moduleId);
        } else {
          setModuleId('');
        }
      } catch (err) {
        setModules([]);
        setModuleId('');
        setSubModules([]);
        setSubModuleId('');
        setCommissions([]);
        setCommissionId('');
      }
    };
    fetchModules();
  }, [mainModuleId]);

  useEffect(() => {
    if (!moduleId) {
      setSubModules([]);
      setSubModuleId('');
      setCommissions([]);
      setCommissionId('');
      return;
    }
    const fetchSubModules = async () => {
      try {
        const apiService = ApiService();
        let res = await apiService.vGet(`/api/sub-modules?module_id=${moduleId}`);
        if (res.data.status === 1 && Array.isArray(res.data.sub_modules)) {
          setSubModules(res.data.sub_modules);
        } else {
          res = await apiService.vGet(`/api/modules/${moduleId}/sub-modules`);
          if (res.data.status === 1 && Array.isArray(res.data.sub_modules)) {
            setSubModules(res.data.sub_modules);
          } else {
            setSubModules([]);
          }
        }
        setCommissions([]);
        setCommissionId('');
        if (initializing && initialData.current.subModuleId) {
          setSubModuleId(initialData.current.subModuleId);
        } else {
          setSubModuleId('');
        }
      } catch (err) {
        setSubModules([]);
        setSubModuleId('');
        setCommissions([]);
        setCommissionId('');
      }
    };
    fetchSubModules();
  }, [moduleId]);

  useEffect(() => {
    if (!subModuleId) {
      setCommissions([]);
      setCommissionId('');
      return;
    }
    const fetchCommissions = async () => {
      try {
        const apiService = ApiService();
        const res = await apiService.vGet(`/api/sub-modules/${subModuleId}/commissions`);
        if (res.data.status === 1) setCommissions(res.data.commissions || []);
        else setCommissions([]);
        if (initializing && initialData.current.commissionId) {
          setCommissionId(initialData.current.commissionId);
          setInitializing(false);
        } else {
          setCommissionId('');
        }
      } catch (err) {
        setCommissions([]);
        setCommissionId('');
      }
    };
    fetchCommissions();
  }, [subModuleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('role_id', roleId);
      formData.append('main_module_id', mainModuleId);
      formData.append('module_id', moduleId);
      formData.append('sub_module_id', subModuleId);
      formData.append('commission_id', commissionId);
      formData.append('status', status);
      const apiService = ApiService();
      const response = await apiService.vPut(`/api/role-module-commission/${id}`, formData, true, true);
      const { data } = response;
      if (data.status !== 1) {
        throw new Error(data.message || 'Failed to update role module commission');
      }
      setSuccess(true);
      setTimeout(() => navigate('/role-commission/list'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Pageheader mainheading="Role Commission Master" parentfolder="Role Commissions" activepage="Edit" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center rounded-top">
              <span className="d-flex align-items-center">
                <i className="bi bi-link-45deg me-2" style={{ fontSize: '1.3rem' }}></i>
                <h5 className="mb-0 fw-semibold">Edit Role Commission</h5>
              </span>
              <button type="button" className="btn btn-primary text-white d-flex align-items-center" onClick={() => navigate('/role-commission/list')}>
                <i className="fa fa-list me-1"></i> Role Commission List
              </button>
            </div>
            <div className="card-body p-4">
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <form onSubmit={handleSubmit} className="row">
                  <div className="mb-3 col-md-4">
                    <label htmlFor="roleId" className="form-label">Role</label>
                    <select
                      id="roleId"
                      className="form-select"
                      value={roleId}
                      onChange={e => setRoleId(e.target.value)}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 col-md-4">
                    <label htmlFor="mainModuleId" className="form-label">Main Module</label>
                    <select
                      id="mainModuleId"
                      className="form-select"
                      value={mainModuleId}
                      onChange={e => setMainModuleId(e.target.value)}
                      required
                    >
                      <option value="">Select Main Module</option>
                      {mainModules.map(mainModule => (
                        <option key={mainModule.id} value={mainModule.id}>{mainModule.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 col-md-4">
                    <label htmlFor="moduleId" className="form-label">Module</label>
                    <select
                      id="moduleId"
                      className="form-select"
                      value={moduleId}
                      onChange={e => setModuleId(e.target.value)}
                      required
                      disabled={!modules.length}
                    >
                      <option value="">Select Module</option>
                      {modules.map(module => (
                        <option key={module.id} value={module.id}>{module.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 col-md-4">
                    <label htmlFor="subModuleId" className="form-label">Sub Module</label>
                    <select
                      id="subModuleId"
                      className="form-select"
                      value={subModuleId}
                      onChange={e => setSubModuleId(e.target.value)}
                      required
                      disabled={!subModules.length}
                    >
                      <option value="">Select Sub Module</option>
                      {subModules.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 col-md-4">
                    <label htmlFor="commissionId" className="form-label">Commission</label>
                    <select
                      id="commissionId"
                      className="form-select"
                      value={commissionId}
                      onChange={e => setCommissionId(e.target.value)}
                      required
                      disabled={!commissions.length}
                    >
                      <option value="">Select Commission</option>
                      {commissions.map(comm => (
                        <option key={comm.id} value={comm.id}>{comm.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 col-md-4">
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
                  <button type="submit" className="btn btn-primary col-md-4 w-100 text-white" disabled={saving}>
                    {saving ? 'Saving...' : (<><i className="bi bi-save me-1"></i> Update Role Commission</>)}
                  </button>
                  {success && <div className="alert alert-success mt-3">Role Commission updated successfully!</div>}
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default EditRoleCommission;
