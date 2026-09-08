import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../../core/services/ApiService';
import { useParams, useNavigate } from 'react-router-dom';

const EditRolePermission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleId, setRoleId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [subModuleId, setSubModuleId] = useState('');
  const [permissionId, setPermissionId] = useState('');
  const [status, setStatus] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // For initial data prefill
  const initialData = useRef({ moduleId: '', subModuleId: '', permissionId: '' });
  const [initializing, setInitializing] = useState(true);

  // Fetch roles, modules, and the current record
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        const [roleRes, moduleRes, itemRes] = await Promise.all([
          apiService.vGet('/api/roles'),
          apiService.vGet('/api/modules'),
          apiService.vGet(`/api/role-module-permissions/${id}`),
        ]);
        if (roleRes.data.status === 1) setRoles(roleRes.data.roles || []);
        if (moduleRes.data.status === 1) setModules(moduleRes.data.modules || []);
        if (itemRes.data.status === 1) {
          const item = itemRes.data.role_module_permission;
          setRoleId(item.role_id ? String(item.role_id) : '');
          setStatus(item.status !== undefined ? String(item.status) : '1');
          // Save for later use
          initialData.current = {
            moduleId: item.module_id ? String(item.module_id) : '',
            subModuleId: item.sub_module_id ? String(item.sub_module_id) : '',
            permissionId: item.permission_id ? String(item.permission_id) : '',
          };
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
    // eslint-disable-next-line
  }, [id]);

  // Fetch submodules when moduleId changes
  useEffect(() => {
    if (!moduleId) {
      setSubModules([]);
      setSubModuleId('');
      setPermissions([]);
      setPermissionId('');
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
        setPermissions([]);
        setPermissionId('');
        // Set subModuleId only on initial load
        if (initializing && initialData.current.subModuleId) {
          setSubModuleId(initialData.current.subModuleId);
        } else {
          setSubModuleId('');
        }
      } catch (err) {
        setSubModules([]);
        setSubModuleId('');
        setPermissions([]);
        setPermissionId('');
      }
    };
    fetchSubModules();
    // eslint-disable-next-line
  }, [moduleId]);

  // Fetch permissions when subModuleId changes
  useEffect(() => {
    if (!subModuleId) {
      setPermissions([]);
      setPermissionId('');
      return;
    }
    const fetchPermissions = async () => {
      try {
        const apiService = ApiService();
        const res = await apiService.vGet(`/api/sub-modules/${subModuleId}/permissions`);
        if (res.data.status === 1) setPermissions(res.data.permissions || []);
        else setPermissions([]);
        // Set permissionId only on initial load
        if (initializing && initialData.current.permissionId) {
          setPermissionId(initialData.current.permissionId);
          setInitializing(false); // Done initializing after this
        } else {
          setPermissionId('');
        }
      } catch (err) {
        setPermissions([]);
        setPermissionId('');
      }
    };
    fetchPermissions();
    // eslint-disable-next-line
  }, [subModuleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('role_id', roleId);
      formData.append('module_id', moduleId);
      formData.append('sub_module_id', subModuleId);
      formData.append('permission_id', permissionId);
      formData.append('status', status);
      const apiService = ApiService();
      const response = await apiService.vPut(`/api/role-module-permissions/${id}`, formData, true, true);
      const { data } = response;
      if (data.status !== 1) {
        throw new Error(data.message || 'Failed to update role module permission');
      }
      setSuccess(true);
      setTimeout(() => navigate('/role-permission/list'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center rounded-top">
              <span className="d-flex align-items-center">
                <i className="bi bi-link-45deg me-2" style={{ fontSize: '1.3rem' }}></i>
                <h5 className="mb-0 fw-semibold">Edit Role Permission</h5>
              </span>
              <button type="button" className="btn btn-primary text-white d-flex align-items-center" onClick={() => navigate('/role-permission/list')}>
                <i className="fa fa-list me-1"></i> Role Permission List
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
                    <label htmlFor="moduleId" className="form-label">Module</label>
                    <select
                      id="moduleId"
                      className="form-select"
                      value={moduleId}
                      onChange={e => setModuleId(e.target.value)}
                      required
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
                    <label htmlFor="permissionId" className="form-label">Permission</label>
                    <select
                      id="permissionId"
                      className="form-select"
                      value={permissionId}
                      onChange={e => setPermissionId(e.target.value)}
                      required
                      disabled={!permissions.length}
                    >
                      <option value="">Select Permission</option>
                      {permissions.map(perm => (
                        <option key={perm.id} value={perm.id}>{perm.name}</option>
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
                    {saving ? 'Saving...' : (<><i className="bi bi-save me-1"></i> Update Role Permission</>)}
                  </button>
                  {success && <div className="alert alert-success mt-3">Role Permission updated successfully!</div>}
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                </form>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EditRolePermission;
