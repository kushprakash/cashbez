
import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const ListPermission = () => {
  const [permissions, setPermissions] = useState([]);
  const [mainModules, setMainModules] = useState([]);
  const [modules, setModules] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiService = ApiService();
        const [permRes, mainModRes, modRes, subModRes] = await Promise.all([
          apiService.vGet('/api/module-permissions'),
          apiService.vGet('/api/main-modules'),
          apiService.vGet('/api/modules'),
          apiService.vGet('/api/sub-modules'),
        ]);
        if (permRes.data.status !== 1) throw new Error(permRes.data.message || 'Failed to fetch permissions');
        if (mainModRes.data.status !== 1) throw new Error(mainModRes.data.message || 'Failed to fetch main modules');
        if (modRes.data.status !== 1) throw new Error(modRes.data.message || 'Failed to fetch modules');
        if (subModRes.data.status !== 1) throw new Error(subModRes.data.message || 'Failed to fetch sub modules');
        setPermissions(permRes.data.permissions || []);
        setMainModules(mainModRes.data.modules || []);
        setModules(modRes.data.modules || []);
        setSubModules(subModRes.data.sub_modules || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMainModuleName = (moduleId) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      const mainMod = mainModules.find(mm => mm.id === mod.main_module_id);
      return mainMod ? mainMod.name : '';
    }
    return '';
  };

  const getModuleName = (id) => {
    const mod = modules.find(m => m.id === id);
    return mod ? mod.name : id;
  };

  const getSubModuleName = (id) => {
    const sub = subModules.find(s => s.id === id);
    return sub ? sub.name : id;
  };

  return (
    <>
      <Pageheader mainheading="Permission Master" parentfolder="Permissions" activepage="List" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                <h3 className="mb-0 fw-bold">Permissions</h3>
                <Link to="/permission/create" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-plus me-1"></i> Create Permission
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
                        Header: 'Main Module',
                        accessor: 'main_module_name',
                        Cell: ({ row }) => getMainModuleName(row.original.module_id),
                      },
                      {
                        Header: 'Module',
                        accessor: 'module_id',
                        Cell: ({ value }) => getModuleName(value),
                      },
                      {
                        Header: 'Sub-Module',
                        accessor: 'sub_module_id',
                        Cell: ({ value }) => getSubModuleName(value),
                      },
                      {
                        Header: 'Name',
                        accessor: 'name',
                      },
                      {
                        Header: 'API Endpoint',
                        accessor: 'endpoint',
                      },
                      {
                        Header: 'Web Route',
                        accessor: 'route',
                      },
                      {
                        Header: 'Status',
                        accessor: 'status',
                        Cell: ({ value }) => value === 1 || value === '1' ? 'Active' : 'Not Active',
                      },
                      {
                        Header: 'Menu Show',
                        accessor: 'menu_show',
                        Cell: ({ value }) => value === 1 || value === '1' ? 'True' : 'False',
                      },
                      {
                        Header: 'Action',
                        accessor: 'action',
                        disableSortBy: true,
                        Cell: ({ row }) => (
                          <Link to={`/permission/edit/${row.original.id}`} className="btn btn-primary btn-sm">Edit</Link>
                        ),
                      },
                    ]}
                    data={permissions}
                    title="Permissions"
                    noDataText="No permissions found."
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

export default ListPermission;
