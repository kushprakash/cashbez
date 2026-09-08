import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const PayrollSetup = () => {
  const [form, setForm] = useState({
    user_id: '', basic: '', hra: '', travel: '', bonus: '', allowances: '', deductions: '', pf: '', tax: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const apiService = ApiService();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await apiService.vGet('/api/employees');
      if (res.data && Array.isArray(res.data)) {
        setEmployees(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setEmployees([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.user_id) errs.user_id = 'Employee is required';
    if (!form.basic) errs.basic = 'Basic salary is required';
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
      const res = await apiService.vPost('/api/payroll/setup', form, true, true);
      if (res.data && res.data.status === 1) {
        toast.success('Payroll setup saved');
        navigate('/hrms/payroll/list');
      } else {
        toast.error(res.data.message || 'Failed to save payroll');
      }
    } catch (err) {
      toast.error('Failed to save payroll');
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer />
      <Pageheader mainheading="Payroll Management" parentfolder="Payroll" activepage="Setup Salary Structure" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Payroll Setup</h5>
                  <Link to="/hrms/payroll/list" className="btn btn-primary btn-sm">Payroll List</Link>
               </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="row">
                    <div className="mb-3 col-md-4">
                      <label htmlFor="user_id" className="form-label">Employee <span className="text-danger">*</span></label>
                      <select
                        className={`form-control ${errors.user_id ? 'is-invalid' : ''}`}
                        id="user_id"
                        name="user_id"
                        value={form.user_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                            {emp.user?.name ? `${emp.user.name} (${emp.emp_code || emp.user_id || emp.id})` : (emp.emp_code || emp.user_id || emp.id)}
                          </option>
                        ))}
                      </select>
                      {errors.user_id && <div className="invalid-feedback">{errors.user_id}</div>}
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="basic" className="form-label">Basic <span className="text-danger">*</span></label>
                      <input type="number" className={`form-control ${errors.basic ? 'is-invalid' : ''}`} id="basic" name="basic" value={form.basic} onChange={handleChange} />
                      {errors.basic && <div className="invalid-feedback">{errors.basic}</div>}
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="hra" className="form-label">HRA</label>
                      <input type="number" className="form-control" id="hra" name="hra" value={form.hra} onChange={handleChange} />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="travel" className="form-label">Travel</label>
                      <input type="number" className="form-control" id="travel" name="travel" value={form.travel} onChange={handleChange} />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="bonus" className="form-label">Bonus</label>
                      <input type="number" className="form-control" id="bonus" name="bonus" value={form.bonus} onChange={handleChange} />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="allowances" className="form-label">Allowances</label>
                      <input type="number" className="form-control" id="allowances" name="allowances" value={form.allowances} onChange={handleChange} />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="deductions" className="form-label">Deductions</label>
                      <input type="number" className="form-control" id="deductions" name="deductions" value={form.deductions} onChange={handleChange} />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="pf" className="form-label">PF</label>
                      <input type="number" className="form-control" id="pf" name="pf" value={form.pf} onChange={handleChange} />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label htmlFor="tax" className="form-label">Tax</label>
                      <input type="number" className="form-control" id="tax" name="tax" value={form.tax} onChange={handleChange} />
                    </div>
                    <div className="col-12 d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Payroll'}
                      </button>
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

export default PayrollSetup;
