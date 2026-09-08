import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const ListSubModule = () => {
  const [subModules, setSubModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiService = ApiService();
        const res = await apiService.vGet('/api/sub_modules');
        const { data } = res;
        if (data.status !== 1) {
          throw new Error(data.message || 'Failed to fetch modules');
        }
        // Fetch all modules for mapping
        const modulesRes = await apiService.vGet('/api/modules');
        const modulesMap = {};
        if (modulesRes.data && modulesRes.data.modules) {
          modulesRes.data.modules.forEach(m => {
            modulesMap[m.id] = m.name;
          });
        }

        // Fetch all main modules for mapping
        const mainModulesRes = await apiService.vGet('/api/main-modules');
        const mainModulesMap = {};
        if (mainModulesRes.data && mainModulesRes.data.modules) {
          mainModulesRes.data.modules.forEach(m => {
            mainModulesMap[m.id] = m.name;
          });
        }

        // Attach module_name and main_module_name to each subModule
        const subModulesWithModuleName = (res.data.modules || []).map(sub => {
          const module = modulesRes.data?.modules?.find(m => m.id === sub.module_id);
          return {
            ...sub,
            module_name: modulesMap[sub.module_id] || '',
            main_module_name: module ? mainModulesMap[module.main_module_id] || '' : '',
          };
        });
        setSubModules(subModulesWithModuleName);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);
  return (
    <>
      <Pageheader mainheading="Sub Module Master" parentfolder="Sub Modules" activepage="List" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
              <h3 className="mb-0 fw-bold">Sub Modules</h3>
              <Link to="/sub-module/create" className="btn btn-primary text-white d-flex align-items-center">
                <i className="fa fa-plus me-1"></i> Create Sub Module
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
                        Header: 'ID',
                        accessor: 'id',
                      },
                      {
                        Header: 'Main Module',
                        accessor: 'main_module_name',
                      },
                      {
                        Header: 'Module Name',
                        accessor: 'module_name',
                      },
                      {
                        Header: 'Sub Module Name',
                        accessor: 'name',
                      },
                      {
                        Header: 'Status',
                        accessor: 'status',
                        Cell: ({ value }) => value ? 'Active' : 'Inactive',
                      },
                      {
                        Header: 'Action',
                        accessor: 'action',
                        disableSortBy: true,
                        Cell: ({ row }) => (
                          <Link to={`/sub-module/edit/${row.original.id}`} className="btn btn-sm btn-warning">Edit</Link>
                        ),
                      },
                    ]}
                    data={subModules}
                    title="Sub Modules"
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

export default ListSubModule;
