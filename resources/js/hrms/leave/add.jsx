
import React, { useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';

const leaveTypes = [
  { label: 'Casual', value: 'Casual' },
  { label: 'Sick', value: 'Sick' },
  { label: 'Earned', value: 'Earned' },
];

const LeaveAdd = () => {
  const [form, setForm] = useState({
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
    user_id: '', // In real app, get from session/auth context
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const apiService = ApiService();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.leave_type) errs.leave_type = 'Leave type is required';
    if (!form.from_date) errs.from_date = 'From date is required';
    if (!form.to_date) errs.to_date = 'To date is required';
    if (!form.reason) errs.reason = 'Reason is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      Object.values(errs).forEach(msg => toast.error(msg));
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.vPost('/api/leaves', form, true, true);
      if (res.data && res.data.id) {
        toast.success('Leave applied successfully');
        navigate('/hrms/leaves/list');
      } else {
        if (res.data.error) {
          Object.values(res.data.error).flat().forEach(msg => toast.error(msg));
        } else {
          toast.error(res.data.message || 'Failed to apply leave');
        }
      }
    } catch (err) {
      if (err?.response?.data?.error) {
        Object.values(err.response.data.error).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error(err?.response?.data?.message || 'Failed to apply leave');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <Pageheader mainheading="Leave Management" parentfolder="HRMS" activepage="Apply Leave" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-calendar2-plus me-2" style={{ fontSize: '1.3rem' }}></i>
                    <h5 className="mb-0 fw-semibold">Apply Leave</h5>
                  </span>
                  <Link to="/hrms/leaves/list" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-list me-1"></i> Leave List
                  </Link>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit} className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="leave_type" className="form-label">Leave Type <span className="text-danger">*</span></label>
                      <select
                        id="leave_type"
                        name="leave_type"
                        className={`form-select ${errors.leave_type ? 'is-invalid' : ''}`}
                        value={form.leave_type}
                        onChange={handleChange}
                      >
                        <option value="">Select leave type</option>
                        {leaveTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      {errors.leave_type && <div className="invalid-feedback">{errors.leave_type}</div>}
                    </div>
                    <div className="mb-3 col-md-3">
                      <label htmlFor="from_date" className="form-label">From Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        id="from_date"
                        name="from_date"
                        className={`form-control ${errors.from_date ? 'is-invalid' : ''}`}
                        value={form.from_date}
                        onChange={handleDateChange}
                      />
                      {errors.from_date && <div className="invalid-feedback">{errors.from_date}</div>}
                    </div>
                    <div className="mb-3 col-md-3">
                      <label htmlFor="to_date" className="form-label">To Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        id="to_date"
                        name="to_date"
                        className={`form-control ${errors.to_date ? 'is-invalid' : ''}`}
                        value={form.to_date}
                        onChange={handleDateChange}
                      />
                      {errors.to_date && <div className="invalid-feedback">{errors.to_date}</div>}
                    </div>
                    <div className="mb-3 col-md-12">
                      <label htmlFor="reason" className="form-label">Reason <span className="text-danger">*</span></label>
                      <textarea
                        id="reason"
                        name="reason"
                        className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                        value={form.reason}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter reason for leave"
                      />
                      {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
                    </div>
                    {/* In real app, user_id should come from session/auth context */}
                
                    <div className="col-12">
                      <div className="d-flex justify-content-end gap-2">
                        <Link to="/hrms/leaves/list" className="btn btn-secondary">
                          <i className="fa fa-times me-1"></i> Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Applying...
                            </>
                          ) : (
                            <>
                              <i className="fa fa-save me-1"></i> Apply Leave
                            </>
                          )}
                        </button>
                      </div>
                    </div>
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

export default LeaveAdd;
