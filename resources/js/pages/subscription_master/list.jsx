import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const SubscriptionMasterList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [mainModules, setMainModules] = useState([]);
  const [modules, setModules] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiService = ApiService();

  useEffect(() => {
    Promise.all([
      apiService.vGet(`/api/main-modules`),
      apiService.vGet(`/api/modules`),
      apiService.vGet(`/api/sub-modules`),
      apiService.vGet(`/api/subscription-masters`)
    ]).then(([mainModRes, modRes, subModRes, subsRes]) => {
      setMainModules(mainModRes.data.modules || []);
      setModules(modRes.data.modules || []);
      setSubModules(subModRes.data.submodules || []);
      setSubscriptions(subsRes.data.data || []);
      setLoading(false);
    });
  }, []);

  const getMainModuleName = (main_module_id) => {
    const mainMod = mainModules.find(mm => String(mm.id) === String(main_module_id));
    return mainMod ? mainMod.name : main_module_id;
  };

  const getModuleName = (module_id) => {
    const mod = modules.find(m => String(m.id || m.module_id) === String(module_id));
    return mod ? (mod.name || mod.label) : module_id;
  };

  const getSubModuleName = (sub_module_id) => {
    if (!sub_module_id) return '-';
    const subMod = subModules.find(sm => String(sm.id) === String(sub_module_id));
    return subMod ? subMod.name : sub_module_id;
  };

  return (
    <>
      <Pageheader mainheading="Subscription Master" parentfolder="Subscription Plans" activepage="List" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">

          <div className="col-md-12">
            <div className="card">
              <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                <h3 className="mb-0 fw-bold">Subscription Masters</h3>
                <Link to="/subscription-master/add" className="btn btn-primary text-white d-flex align-items-center">
                  <i className="fa fa-plus me-1"></i> Create Subscription
                </Link>
              </div>
              {loading && <TableShimmerLoader />}
              <div className="card-body p-0">
                <DataTable
                  columns={[
                    {
                      Header: 'ID',
                      accessor: 'id',
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
                      Header: 'Duration',
                      accessor: 'duration',
                    },
                    {
                      Header: 'Duration Type',
                      accessor: 'duration_type',
                    },
                    {
                      Header: 'Descriptions',
                      accessor: 'description',
                      Cell: ({ value }) => value ? value.split(',').map((d, i) => <div key={i}>{d}</div>) : '',
                    },
                    {
                      Header: 'Price',
                      accessor: 'price',
                    },
                    {
                      Header: 'Status',
                      accessor: 'status',
                      Cell: ({ value }) => value === 1 ? 'Active' : 'Not Active',
                    },
                    {
                      Header: 'Action',
                      accessor: 'action',
                      disableSortBy: true,
                      Cell: ({ row }) => (
                        <Link to={`/subscription-master/edit/${row.original.id}`} className="btn btn-sm btn-primary">Edit</Link>
                      ),
                    },
                  ]}
                  data={subscriptions}
                  title="Subscription Masters"
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

export default SubscriptionMasterList;
