
import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';


const CommissionList = () => {
  const [commissions, setCommissions] = useState([]);
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
        const [commRes, mainModRes, modRes, subModRes] = await Promise.all([
          apiService.vGet('/api/module-commissions'),
          apiService.vGet('/api/main-modules'),
          apiService.vGet('/api/modules'),
          apiService.vGet('/api/sub-modules'),
        ]);
        if (commRes.data.status !== 1) throw new Error(commRes.data.message || 'Failed to fetch commissions');
        if (mainModRes.data.status !== 1) throw new Error(mainModRes.data.message || 'Failed to fetch main modules');
        if (modRes.data.status !== 1) throw new Error(modRes.data.message || 'Failed to fetch modules');
        if (subModRes.data.status !== 1) throw new Error(subModRes.data.message || 'Failed to fetch sub modules');
        setCommissions(commRes.data.commissions || []);
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

  const getMainModuleName = (id) => {
    if (!id) return '-';
    const mainMod = mainModules.find(m => m.id === id);
    return mainMod ? mainMod.name : id;
  };

  const getModuleName = (id) => {
    const mod = modules.find(m => m.id === id);
    return mod ? mod.name : id;
  };

  const getSubModuleName = (id) => {
    if (!id) return '-';
    const sub = subModules.find(s => s.id === id);
    return sub ? sub.name : id;
  };

  const getMode = (mode) => mode === 0 || mode === '0' ? 'Not Slab' : 'Slab';
  const getType = (type) => type === 0 || type === '0' ? 'Flat' : 'Percentage';
  const showAmt = (amt) => (amt === null || amt === undefined || amt === '') ? '--' : amt;

  return (
    <>
      <Pageheader mainheading="Commission Master" parentfolder="Commissions" activepage="List" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
            <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                <h3 className="mb-0 fw-bold">Commissions/Charges</h3>
                <Link to="/commission/create" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-plus me-1"></i> Create Commission/Charge
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
                        accessor: 'main_module_id',
                        Cell: ({ value }) => getMainModuleName(value),
                      },
                      {
                        Header: 'Module',
                        accessor: 'module_id',
                        Cell: ({ value }) => getModuleName(value),
                      },
                      {
                        Header: 'Sub Module',
                        accessor: 'sub_module_id',
                        Cell: ({ value }) => getSubModuleName(value),
                      },
                      {
                        Header: 'Mode',
                        accessor: 'mode',
                        Cell: ({ value }) => getMode(value),
                      },
                      {
                        Header: 'From Amt',
                        accessor: 'from_amt',
                        Cell: ({ value }) => showAmt(value),
                      },
                      {
                        Header: 'To Amt',
                        accessor: 'to_amt',
                        Cell: ({ value }) => showAmt(value),
                      },
                      {
                        Header: 'Type',
                        accessor: 'commission_type',
                        Cell: ({ value }) => getType(value),
                      },
                      {
                        Header: 'Commission',
                        accessor: 'commission',
                      },
                      {
                        Header: 'Transaction Type',
                        accessor: 'txn_type',
                        Cell: ({ value }) => {
                          const txnType = value || 'Commission';
                          const isCommission = txnType === 'Commission';
                          return (
                            <span 
                              className={`badge ${isCommission ? 'bg-success' : 'bg-danger'}`}
                              style={{ color: 'white' }}
                            >
                              {txnType}
                            </span>
                          );
                        },
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
                          <Link to={`/commission/edit/${row.original.id}`} className="btn btn-primary btn-sm">Edit</Link>
                        ),
                      },
                    ]}
                    data={commissions}
                    title="Commissions"
                    noDataText="No commissions found."
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

export default CommissionList;
