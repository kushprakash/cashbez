import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import { toast, ToastContainer } from 'react-toastify';

const PayrollList = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiService = ApiService();

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await apiService.vGet('/api/payroll/list', true, true);
      if (res.data && res.data.status === 1) {
        setPayrolls(res.data.data);
      } else {
        setPayrolls([]);
        toast.error(res.data.message || 'Failed to fetch payrolls');
      }
    } catch (err) {
      setPayrolls([]);
      toast.error('Failed to fetch payrolls');
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer />
      <Pageheader mainheading="Payroll Management" parentfolder="Payroll" activepage="Payroll List" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Payroll List</h5>
                  <Link to="/hrms/payroll/setup" className="btn btn-primary btn-sm">Add Payroll</Link>
                </div>
                <div className="card-body">
                  {loading ? (
                    <TableShimmerLoader columns={8} rows={8} />
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Basic</th>
                            <th>HRA</th>
                            <th>Travel</th>
                            <th>Bonus</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>PF</th>
                            <th>Tax</th>
                            <th>Created At</th>
                            <th>Created By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payrolls.length === 0 ? (
                            <tr><td colSpan="12" className="text-center">No records found</td></tr>
                          ) : (
                            payrolls.map(pay => (
                              <tr key={pay.id}>
                                <td>{pay.user?.name || pay.user_id}</td>
                                <td>{pay.basic}</td>
                                <td>{pay.hra}</td>
                                <td>{pay.travel}</td>
                                <td>{pay.bonus}</td>
                                <td>{pay.allowances}</td>
                                <td>{pay.deductions}</td>
                                <td>{pay.pf}</td>
                                <td>{pay.tax}</td>
                                <td>{pay.created_at ? new Date(pay.created_at).toLocaleString() : '-'}</td>
                                <td>{pay.created_by?.name || pay.created_by?.email || '-'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
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

export default PayrollList;
