import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link, useParams } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const EditRole = () => {
  const { id } = useParams();
  const [roleName, setRoleName] = useState('');
  const [status, setStatus] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiService = ApiService();
        const response = await apiService.vGet(`/api/roles/${id}`);
        const { data } = response;
        if (data.status !== 1) {
          throw new Error(data.message || 'Failed to fetch role');
        }
        setRoleName(data.role.name || '');
        setStatus(data.role.status !== undefined ? String(data.role.status) : '1');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRole();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('name', roleName);
      formData.append('status', status);
      const apiService = ApiService();
      const response = await apiService.vPut(`/api/roles/${id}`, formData, true, true, 'put');
      const { data } = response;
      if (data.status !== 1) {
        throw new Error(data.message || 'Failed to update role');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pageheader mainheading="Role Master" parentfolder="Roles" activepage="Edit" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">

          <div className="col-md-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                <span className="d-flex align-items-center">
                  <i className="bi bi-person-badge me-2" style={{ fontSize: '1.3rem' }}></i>
                  <h5 className="mb-0 fw-semibold">Edit Role</h5>
                </span>
                <Link to="/role/list" className="btn btn-primary text-white d-flex align-items-center">
                  <i className="fa fa-list me-1"></i> Role List
                </Link>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="roleName" className="form-label">Role Name</label>
                    <input
                      type="text"
                      id="roleName"
                      className="form-control"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
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
                  <button type="submit" className="btn btn-primary w-100 text-white" disabled={loading}>
                    {loading ? 'Saving...' : <><i className="bi bi-plus-circle me-1"></i> Edit Role</>}
                  </button>
                  {success && <div className="alert alert-success mt-3">Role updated successfully!</div>}
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

export default EditRole;

