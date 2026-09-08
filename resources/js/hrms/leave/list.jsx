import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const statusMap = {
  0: { label: 'Pending', color: 'warning' },
  1: { label: 'Approved', color: 'success' },
  2: { label: 'Rejected', color: 'danger' },
};

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiService = ApiService();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    setLoading(true);
    apiService.vGet(`/api/leaves`).then(res => {
      setLeaves(res.data || []);
      setLoading(false);
    }).catch(err => {
      toast.error('Failed to fetch leaves');
      setLoading(false);
    });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <Pageheader mainheading="Leave Management" parentfolder="HRMS" activepage="Leave List" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                  <span className="d-flex align-items-center">
                    <i className="bi bi-calendar2-week me-2" style={{ fontSize: '1.3rem' }}></i>
                    <h3 className="mb-0 fw-bold">Leaves</h3>
                  </span>
                  <Link to="/hrms/leaves/add" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-plus me-1"></i> Apply Leave
                  </Link>
                </div>
                <div className="card-body p-0">
                  {loading && <TableShimmerLoader />}
                  <DataTable
                    columns={[
                      {
                        Header: 'ID',
                        accessor: 'id',
                        Cell: ({ value }) => (
                          <span className="badge bg-light text-dark">{value}</span>
                        ),
                      },
                      {
                        Header: 'Employee',
                        accessor: 'employee.emp_code',
                        Cell: ({ value }) => (
                          <span className="fw-semibold">{value || '-'}</span>
                        ),
                      },
                      {
                        Header: 'Leave Type',
                        accessor: 'leave_type',
                        Cell: ({ value }) => (
                          <span className="badge bg-info text-white">{value}</span>
                        ),
                      },
                      {
                        Header: 'From',
                        accessor: 'from_date',
                        Cell: ({ value }) => value || '-',
                      },
                      {
                        Header: 'To',
                        accessor: 'to_date',
                        Cell: ({ value }) => value || '-',
                      },
                      {
                        Header: 'Reason',
                        accessor: 'reason',
                        Cell: ({ value }) => value || '-',
                      },
                      {
                        Header: 'Status',
                        accessor: 'status',
                        Cell: ({ value }) => {
                          const status = statusMap[String(value)] || { label: value, color: 'secondary' };
                          return (
                            <span className={`badge bg-${status.color}`}>{status.label}</span>
                          );
                        },
                      },
                      {
                        Header: 'Applied At',
                        accessor: 'applied_at',
                        Cell: ({ value }) => {
                          if (!value) return '-';
                          const date = new Date(value);
                          return date.toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                        },
                      },
                      {
                        Header: 'Actions',
                        accessor: 'action',
                        disableSortBy: true,
                        Cell: ({ row }) => (
                          <div className="d-flex gap-2">
                            <Link 
                              to={`/hrms/leaves/edit/${row.original.id}`} 
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Leave"
                            >
                              <i className="fa fa-edit"></i>
                            </Link>
                          </div>
                        ),
                      },
                    ]}
                    data={leaves}
                    title="Leaves"
                    noDataText="No leaves found."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaveList;
