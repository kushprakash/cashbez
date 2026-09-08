import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const ListModule = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiService = ApiService();
        const response = await apiService.vGet('/api/main-modules');
        const { data } = response;
        if (data.status !== 1) {
          throw new Error(data.message || 'Failed to fetch modules');
        }
        setModules(data.modules || []);
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
      <Pageheader mainheading="Main Module Master" parentfolder="Main Modules" activepage="List" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                <h3 className="mb-0 fw-bold">Main Modules</h3>
                <Link to="/module/create" className="btn btn-primary text-white d-flex align-items-center">
                  <i className="fa fa-plus me-1"></i> Create Module
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
                          Header: 'Name',
                          accessor: 'name',
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
                            <Link to={`/main-module/edit/${row.original.id}`} className="btn btn-primary btn-sm">Edit</Link>
                          ),
                        },
                      ]}
                      data={modules}
                      title="Modules"
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

export default ListModule;
