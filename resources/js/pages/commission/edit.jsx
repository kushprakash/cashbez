import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const CommissionEdit = () => {
  const { id } = useParams();
  const [mainModules, setMainModules] = useState([]);
  const [mainModuleId, setMainModuleId] = useState('');
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState('');
  const [subModules, setSubModules] = useState([]);
  const [subModuleId, setSubModuleId] = useState('');
  const [mode, setMode] = useState('1'); // 1 = Slab, 0 = Not Slab
  const [fromAmt, setFromAmt] = useState('');
  const [toAmt, setToAmt] = useState('');
  const [commissionType, setCommissionType] = useState('1'); // 1 = Percentage, 0 = Flat
  const [commission, setCommission] = useState('');
  const [txnType, setTxnType] = useState('Commission');
  const [status, setStatus] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiService = ApiService();
        const [commRes, mainModRes] = await Promise.all([
          apiService.vGet(`/api/module-commissions/${id}`),
          apiService.vGet('/api/main-modules'),
        ]);
        if (commRes.data.status !== 1) throw new Error(commRes.data.message || 'Failed to fetch commission');
        if (mainModRes.data.status !== 1) throw new Error(mainModRes.data.message || 'Failed to fetch main modules');
        const comm = commRes.data.commission;
        setMainModuleId(comm.main_module_id ? String(comm.main_module_id) : '');
        setModuleId(comm.module_id ? String(comm.module_id) : '');
        setSubModuleId(comm.sub_module_id ? String(comm.sub_module_id) : '');
        setMode(comm.mode === 0 || comm.mode === '0' ? '0' : '1');
        setFromAmt(comm.from_amt || '');
        setToAmt(comm.to_amt || '');
        setCommissionType(comm.commission_type === 0 || comm.commission_type === '0' ? '0' : '1');
        setCommission(comm.commission || '');
        setTxnType(comm.txn_type || 'Commission');
        setStatus(comm.status !== undefined ? String(comm.status) : '1');
        setMainModules(mainModRes.data.modules || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    const fetchModules = async () => {
      if (!mainModuleId) {
        setModules([]);
        setModuleId('');
        setSubModules([]);
        setSubModuleId('');
        return;
      }
      try {
        const apiService = ApiService();
        const response = await apiService.vGet(`/api/modules/by-main-module/${mainModuleId}`);
        if (response.data.status === 1) {
          setModules(response.data.modules || []);
          // If editing, keep the selected moduleId if it exists in the new list
          setModuleId(prev => {
            if (prev && response.data.modules.some(mod => String(mod.id) === String(prev))) {
              return prev;
            } else {
              return '';
            }
          });
        } else {
          setModules([]);
          setModuleId('');
        }
      } catch (err) {
        setModules([]);
        setModuleId('');
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
      try {
        const apiService = ApiService();
        const response = await apiService.vGet(`/api/sub_modules_by_id?module_id=${moduleId}`);
        if (response.data.status === 1) {
          setSubModules(response.data.modules || []);
          // If editing, keep the selected subModuleId if it exists in the new list
          setSubModuleId(prev => {
            if (prev && response.data.modules.some(sub => String(sub.id) === String(prev))) {
              return prev;
            } else {
              return '';
            }
          });
        } else {
          setSubModules([]);
          setSubModuleId('');
        }
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
      const response = await apiService.vPut(`/api/module-commissions/${id}`, formData, true, true, 'put');
      if (response.data.status !== 1) {
        throw new Error(response.data.message || 'Failed to update commission');
      }
      setSuccess(true);
      // setTimeout(() => navigate('/commission/list'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pageheader mainheading="Commission Master" parentfolder="Commissions" activepage="Edit" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                <span className="d-flex align-items-center">
                  <i className="bi bi-cash-coin me-2" style={{ fontSize: '1.3rem' }}></i>
                  <h5 className="mb-0 fw-semibold">Edit Commission/Charge</h5>
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
                    <select id="moduleId" className="form-select" value={moduleId} onChange={e => setModuleId(e.target.value)} disabled={!mainModuleId || modules.length === 0} required>
                      <option value="">{modules.length === 0 ? 'No Modules Found' : 'Select Module'}</option>
                      {modules.map(module => (
                        <option key={module.id} value={module.id}>{module.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="subModuleId" className="form-label">Sub Module</label>
                    <select id="subModuleId" className="form-select" value={subModuleId} onChange={e => setSubModuleId(e.target.value)} disabled={!moduleId || subModules.length === 0}>
                      <option value="">{subModules.length === 0 ? 'No Sub Modules Found' : 'Select Sub Module'}</option>
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
                    {loading ? 'Saving...' : <><i className="bi bi-plus-circle me-1"></i> Edit Commission</>}
                  </button>
                  {success && <div className="alert alert-success mt-3">Commission updated successfully!</div>}
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

export default CommissionEdit;
