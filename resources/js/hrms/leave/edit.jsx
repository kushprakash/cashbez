
import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';

const leaveTypes = [
  { label: 'Casual', value: 'Casual' },
  { label: 'Sick', value: 'Sick' },
  { label: 'Earned', value: 'Earned' },
];
const statusOptions = [
  { label: 'Pending', value: 0 },
  { label: 'Approved', value: 1 },
  { label: 'Rejected', value: 2 },
];

const LeaveEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
    user_id: '',
    status: 0, // Default to pending
    approval_remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isApproval, setIsApproval] = useState(false);
  const navigate = useNavigate();
  const apiService = ApiService();

  useEffect(() => {
    fetchLeave();
  }, [id]);

  const fetchLeave = async () => {
    try {
      setPageLoading(true);
      const res = await apiService.vGet(`/api/leaves/${id}`);
      const leave = res.data;
      setForm({
        leave_type: leave.leave_type || '',
        from_date: leave.from_date || '',
        to_date: leave.to_date || '',
        reason: leave.reason || '',
        user_id: leave.user_id || '',
        status: leave.status || 0,
        approval_remarks: leave.approval_remarks || '',
      });
      setIsApproval(leave.status === 0);
    } catch (err) {
      toast.error('Failed to fetch leave details');
      navigate('/hrms/leaves/list');
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.status) errs.status = 'Status is required';
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
      const res = await apiService.vPut(`/api/leaves/${id}`, {
        status: form.status,
        approval_remarks: form.approval_remarks,
      }, true, true, 'put');
      if (res.data && res.data.status !== 0) {
        toast.success('Leave updated successfully');
        navigate('/hrms/leaves/list');
      } else {
        if (res.data.error) {
          Object.values(res.data.error).flat().forEach(msg => toast.error(msg));
        } else {
          toast.error(res.data.message || 'Failed to update leave');
        }
      }
    } catch (err) {
      if (err?.response?.data?.error) {
        Object.values(err.response.data.error).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update leave');
      }
    }
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <>
        <Pageheader mainheading="Leave Management" parentfolder="HRMS" activepage="Edit Leave" />
        <div className="page-content-box">
          <div className="page-content-box-inner">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body p-4 text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading leave details...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <Pageheader mainheading="Leave Management" parentfolder="HRMS" activepage="Edit Leave" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-calendar2-plus me-2" style={{ fontSize: '1.3rem' }}></i>
                    <h5 className="mb-0 fw-semibold">Edit Leave</h5>
                  </span>
                  <Link to="/hrms/leaves/list" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-list me-1"></i> Leave List
                  </Link>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit} className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="leave_type" className="form-label">Leave Type</label>
                      <input
                        type="text"
                        className="form-control"
                        id="leave_type"
                        name="leave_type"
                        value={form.leave_type}
                      />
                    </div>
                    <div className="mb-3 col-md-3">
                      <label htmlFor="from_date" className="form-label">From Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="from_date"
                        name="from_date"
                        value={form.from_date}
                      
                      />
                    </div>
                    <div className="mb-3 col-md-3">
                      <label htmlFor="to_date" className="form-label">To Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="to_date"
                        name="to_date"
                        value={form.to_date}
                     
                      />
                    </div>
                    <div className="mb-3 col-md-12">
                      <label htmlFor="reason" className="form-label">Reason</label>
                      <textarea
                        id="reason"
                        name="reason"
                        className="form-control"
                        value={form.reason}
                     
                        rows={3}
                      />
                    </div>
                 
                    <div className="mb-3 col-md-3">
                      <label htmlFor="status" className="form-label">Status <span className="text-danger">*</span></label>
                      <select
                        id="status"
                        name="status"
                        className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                        value={form.status}
                        onChange={handleChange}
                        disabled={!isApproval}
                      >
                        <option value="">Select status</option>
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value} >{opt.label}</option>
                        ))}
                      </select>
                      {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                    </div>
                    <div className="mb-3 col-md-3">
                      <label htmlFor="approval_remarks" className="form-label">Approval Remarks</label>
                      <input
                        type="text"
                        className="form-control"
                        id="approval_remarks"
                        name="approval_remarks"
                        value={form.approval_remarks}
                        onChange={handleChange}
                        disabled={!isApproval}
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-end gap-2">
                        <Link to="/hrms/leaves/list" className="btn btn-secondary">
                          <i className="fa fa-times me-1"></i> Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={loading || !isApproval}>
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="fa fa-save me-1"></i> Update Leave
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

export default LeaveEdit;
