import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const EditSubModule = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', status: 1 });
  const [mainModules, setMainModules] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedMainModule, setSelectedMainModule] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiService = ApiService();

        // Fetch main modules
        const mainModulesRes = await apiService.vGet('/api/main-modules');
        if (mainModulesRes.data && mainModulesRes.data.modules) {
          setMainModules(mainModulesRes.data.modules);
        }

        // Fetch sub module data
        const res = await apiService.vGet(`/api/sub_modules/${id}`);
        if (res.data) {
          setForm(res.data);

          // If sub module has a module_id, fetch the module details to get main_module_id
          if (res.data.module_id) {
            const moduleRes = await apiService.vGet(`/api/modules/${res.data.module_id}`);
            if (moduleRes.data && moduleRes.data.module && moduleRes.data.module.main_module_id) {
              const mainModuleId = moduleRes.data.module.main_module_id;
              setSelectedMainModule(mainModuleId);
              // Fetch modules for the selected main module
              fetchModulesByMainModule(mainModuleId);
            }
          }
        }
      } catch (err) {
        setError('Failed to fetch data');
      }
    };
    fetchData();
  }, [id]);

  const fetchModulesByMainModule = async (mainModuleId) => {
    try {
      const apiService = ApiService();
      const res = await apiService.vGet(`/api/modules/by-main-module/${mainModuleId}`);
      if (res.data && res.data.modules) {
        setModules(res.data.modules);
      } else {
        setModules([]);
      }
    } catch (err) {
      setError('Failed to fetch modules');
      setModules([]);
    }
  };

  const handleMainModuleChange = (e) => {
    const mainModuleId = e.target.value;
    setSelectedMainModule(mainModuleId);
    setForm({ ...form, module_id: '' }); // Reset module selection
    if (mainModuleId) {
      fetchModulesByMainModule(mainModuleId);
    } else {
      setModules([]);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const apiService = ApiService();
      const formDataToSubmit = {
        ...form,
        main_module_id: selectedMainModule
      };
      const res = await apiService.vPut(`/api/sub_modules/${id}`, formDataToSubmit);
      if (res.data && (res.data.status === 1 || res.data.data)) {
        setSuccess(true);
        //navigate('/sub-module/list');
      } else {
        setError('Failed to update sub module');
      }
    } catch (err) {
      setError('Failed to update sub module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pageheader mainheading="Sub Module Master" parentfolder="Sub Modules" activepage="Edit" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">

          <div className="col-md-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                <span className="d-flex align-items-center">
                  <i className="bi bi-box me-2" style={{ fontSize: '1.3rem' }}></i>
                  <h5 className="mb-0 fw-semibold">Edit Sub Module</h5>
                </span>
                <Link to="/sub-module/list" className="btn btn-primary text-white d-flex align-items-center">
                  <i className="fa fa-list me-1"></i> Sub Module List
                </Link>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Main Module</label>
                    <select
                      name="main_module_id"
                      className="form-control"
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

                  <div className="mb-3">
                    <label>Module</label>
                    <select name="module_id" className="form-control" value={form.module_id || ''} onChange={handleChange} required>
                      <option value="">Select Module</option>
                      {modules.map(module => <option key={module.id} value={module.id}>{module.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>Name</label>
                    <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label>Status</label>
                    <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
                  {success && <div className="alert alert-success mt-3">Sub Module updated successfully!</div>}
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

export default EditSubModule;
