import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import Pageheader from '../../layouts/Pageheader';

const ReleaseSalary = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [salary, setSalary] = useState(null);
  const navigate = useNavigate();
  const apiService = ApiService();

  useEffect(() => {
    fetchSalary();
  }, []);

  const fetchSalary = async () => {
    setLoading(true);
    try {
      const res = await apiService.vGet(`/api/salary/view/${id}`, true, true);
      if (res.data && res.data.status === 1) {
        setSalary(res.data.data);
      } else {
        toast.error(res.data.message || 'Failed to fetch salary details');
      }
    } catch (err) {
      toast.error('Failed to fetch salary details');
    }
    setLoading(false);
  };

  const handleRelease = async () => {
    setLoading(true);
    try {
      const res = await apiService.vPost(`/api/salary/pay/${id}`, {}, true, true);
      if (res.data && res.data.status === 1) {
        toast.success('Salary released successfully');
        navigate('/payroll/employees');
      } else {
        toast.error(res.data.message || 'Failed to release salary');
      }
    } catch (err) {
      toast.error('Failed to release salary');
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer />
      <Pageheader mainheading="Payroll Management" parentfolder="Payroll" activepage="Release Salary" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Release Salary</h5>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div>Loading...</div>
                  ) : salary ? (
                    <>
                      <div className="mb-3"><strong>Employee:</strong> {salary.employee_name}</div>
                      <div className="mb-3"><strong>Month:</strong> {salary.month}</div>
                      <div className="mb-3"><strong>Net Salary:</strong> {salary.net_salary}</div>
                      <button className="btn btn-success" onClick={handleRelease} disabled={salary.salary_status === 1 || loading}>
                        {salary.salary_status === 1 ? 'Salary Released' : 'Release Salary'}
                      </button>
                    </>
                  ) : (
                    <div>No salary details found.</div>
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

export default ReleaseSalary;
