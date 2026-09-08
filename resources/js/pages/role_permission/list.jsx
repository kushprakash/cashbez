
import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const ListRolePermission = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiService = ApiService();
        const itemRes = await apiService.vGet('/api/role-module-permissions');
        if (itemRes.data.status === 1) setItems(itemRes.data.role_module_permissions || []);
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
      <Pageheader mainheading="Role Permission Master" parentfolder="Role Permissions" activepage="List" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                <h3 className="mb-0 fw-bold">Role Module Permissions</h3>
                <Link to="/role-permission/create" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-plus me-1"></i> Add Role Module Permission
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
                        Header: 'Permission',
                        accessor: 'permission',
                        Cell: ({ row }) => row.original.permission?.name || '-',
                      },
                      {
                        Header: 'EndPoint',
                        accessor: 'endpoint',
                        Cell: ({ row }) => row.original.permission?.endpoint || '-',
                      },
                     
                     
                    ]}
                    data={items}
                    title="Role Module Permissions"
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

export default ListRolePermission;
