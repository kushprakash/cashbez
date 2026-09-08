
import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const ListRoleCommission = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiService = ApiService();
        const itemRes = await apiService.vGet('/api/role-module-commission');
        if (itemRes.data.status === 1) setItems(itemRes.data.role_module_commissions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Pageheader mainheading="Role Commission Master" parentfolder="Role Commissions" activepage="List" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                <h3 className="mb-0 fw-bold">Role Module Commissions</h3>
                <Link to="/role-commission/create" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-plus me-1"></i> Add Role Module Commission
                </Link>
            </div>
            {loading && <TableShimmerLoader />}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && (
              <div className="card border-0">
                <div className="card-body p-0">
                  <DataTable
                    columns={[
                      {
                        Header: 'SN',
                        accessor: 'sn',
                        Cell: ({ row }) => row.index + 1,
                      },
                      {
                        Header: 'Role',
                        accessor: 'role',
                        Cell: ({ row }) => row.original.role?.name || '-',
                      },
                      {
                        Header: 'Main Module',
                        accessor: 'main_module',
                        Cell: ({ row }) => row.original.main_module?.name || '-',
                      },
                      {
                        Header: 'Module',
                        accessor: 'module',
                        Cell: ({ row }) => row.original.module?.name || '-',
                      },
                      {
                        Header: 'Sub Module',
                        accessor: 'sub_module',
                        Cell: ({ row }) => row.original.sub_module?.name || '-',
                      },
                      {
                        Header: 'Commission',
                        accessor: 'commission',
                        Cell: ({ row }) => row.original.commission?.name || '-',
                      },
                      {
                        Header: 'Status',
                        accessor: 'status',
                        Cell: ({ value }) => value === 1 || value === '1' ? 'Active' : 'Not Active',
                      },
                      {
                        Header: 'Action',
                        accessor: 'action',
                        disableSortBy: true,
                        Cell: ({ row }) => (
                          <Link to={`/role-commission/edit/${row.original.id}`} className="btn btn-primary btn-sm">Edit</Link>
                        ),
                      },
                    ]}
                    data={items}
                    title="Role Module Commissions"
                    noDataText="No data found."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default ListRoleCommission;
