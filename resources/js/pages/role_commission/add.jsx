import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const AddRoleCommission = () => {
  const [roles, setRoles] = useState([]);
  const [mainModules, setMainModules] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState('Commission'); // New state for transaction type
  const [selectedCommissions, setSelectedCommissions] = useState([]); // [{main_module_id, module_id, sub_module_id, commission_id}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        
        // Build API URL with txn_type filter if selected
        let treeApiUrl = '/api/module-tree-commissions';
        if (selectedTransactionType !== '') {
          treeApiUrl += `?txn_type=${selectedTransactionType}`;
        }
        
        const [roleRes, treeRes, mainModRes] = await Promise.all([
          apiService.vGet('/api/roles'),
          apiService.vGet(treeApiUrl),
          apiService.vGet('/api/main-modules'),
        ]);
        if (roleRes.data.status === 1) setRoles(roleRes.data.roles || []);
        
        const modulesList = treeRes.data.modules || [];
        setModules(modulesList);
        
        if (mainModRes.data.status === 1) {
          // Group modules under their main modules
          const mainModulesList = mainModRes.data.modules || [];
          const organizedMainModules = mainModulesList.map(mainModule => ({
            ...mainModule,
            modules: modulesList.filter(module => 
              module.main_module_id === mainModule.id || 
              (module.main_module_id === undefined && mainModule.id === mainModulesList[0]?.id)
            )
          }));
          setMainModules(organizedMainModules);
        }
      } catch (err) {
        setModules([]);
        setMainModules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [selectedTransactionType]); // Add selectedTransactionType as dependency

  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedCommissions([]);
      return;
    }
    const fetchRoleCommissions = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        const assignedRes = await apiService.vGet(`/api/role-module-commissions?role_id=${selectedRoleId}`);
        if (assignedRes.data && assignedRes.data.status === 1) {
          setSelectedCommissions(
            (assignedRes.data.role_module_commissions || []).map(item => ({
              main_module_id: item.main_module_id || 1, // Default to 1 if not present
              module_id: item.module_id,
              sub_module_id: item.sub_module_id,
              commission_id: item.commission_id
            }))
          );
        } else {
          setSelectedCommissions([]);
        }
      } catch (err) {
        setSelectedCommissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoleCommissions();
  }, [selectedRoleId]);

  const isCommissionChecked = (moduleId, subModuleId, commissionId) => {
    return selectedCommissions.some(sc => sc.module_id === moduleId && sc.sub_module_id === subModuleId && sc.commission_id === commissionId);
  };

  const handleTransactionTypeChange = (newTransactionType) => {
    setSelectedTransactionType(newTransactionType);
    setSelectedCommissions([]); // Clear selections when transaction type changes
  };

  const handleCommissionCheck = (moduleId, subModuleId, commissionId, checked) => {
    const mainModuleId = getMainModuleForModule(moduleId);
    if (checked) {
      setSelectedCommissions(prev => ([...prev, { main_module_id: mainModuleId, module_id: moduleId, sub_module_id: subModuleId, commission_id: commissionId }]));
    } else {
      setSelectedCommissions(prev => prev.filter(sc => !(sc.module_id === moduleId && sc.sub_module_id === subModuleId && sc.commission_id === commissionId)));
    }
  };

  const handleToggleSubModule = (moduleId, subModuleId, comms, selectAll) => {
    const mainModuleId = getMainModuleForModule(moduleId);
    if (selectAll) {
      setSelectedCommissions(prev => ([
        ...prev,
        ...comms.filter(comm => !prev.some(sc => sc.module_id === moduleId && sc.sub_module_id === subModuleId && sc.commission_id === comm.id)).map(comm => ({ main_module_id: mainModuleId, module_id: moduleId, sub_module_id: subModuleId, commission_id: comm.id }))
      ]));
    } else {
      setSelectedCommissions(prev => prev.filter(sc => !(sc.module_id === moduleId && sc.sub_module_id === subModuleId)));
    }
  };

  const handleToggleModule = (module, selectAll) => {
    const mainModuleId = getMainModuleForModule(module.id);
    let allComms = [];
    (module.sub_modules || []).forEach(sub => {
      if (sub.commissions && sub.commissions.length > 0) {
        allComms = allComms.concat(sub.commissions.map(comm => ({ main_module_id: mainModuleId, module_id: module.id, sub_module_id: sub.id, commission_id: comm.id })));
      }
    });
    if (selectAll) {
      setSelectedCommissions(prev => ([
        ...prev,
        ...allComms.filter(nc => !prev.some(sc => sc.module_id === nc.module_id && sc.sub_module_id === nc.sub_module_id && sc.commission_id === nc.commission_id))
      ]));
    } else {
      setSelectedCommissions(prev => prev.filter(sc => !allComms.some(nc => nc.module_id === sc.module_id && nc.sub_module_id === sc.sub_module_id && nc.commission_id === sc.commission_id)));
    }
  };

  const isAllSubModuleSelected = (moduleId, subModuleId, comms) => {
    return comms && comms.length > 0 && comms.every(comm => selectedCommissions.some(sc => sc.module_id === moduleId && sc.sub_module_id === subModuleId && sc.commission_id === comm.id));
  };

  const isAllModuleSelected = (module) => {
    let allComms = [];
    (module.sub_modules || []).forEach(sub => {
      if (sub.commissions && sub.commissions.length > 0) {
        allComms = allComms.concat(sub.commissions.map(comm => ({ module_id: module.id, sub_module_id: sub.id, commission_id: comm.id })));
      }
    });
    return allComms.length > 0 && allComms.every(nc => selectedCommissions.some(sc => sc.module_id === nc.module_id && sc.sub_module_id === nc.sub_module_id && sc.commission_id === nc.commission_id));
  };

  // Main module functions
  const getMainModuleForModule = (moduleId) => {
    // Find which main module contains this module
    for (const mainModule of mainModules) {
      const moduleRes = modules.find(m => m.id === moduleId);
      if (moduleRes && moduleRes.main_module_id === mainModule.id) {
        return mainModule.id;
      }
    }
    return mainModules.length > 0 ? mainModules[0].id : 1; // Default to first main module or 1
  };

  const handleMainModuleToggle = (mainModuleId, selectAll) => {
    // Find the main module and get all its modules
    const mainModule = mainModules.find(mm => mm.id === mainModuleId);
    if (!mainModule || !mainModule.modules) return;
    
    let allComms = [];
    mainModule.modules.forEach(module => {
      (module.sub_modules || []).forEach(sub => {
        if (sub.commissions && sub.commissions.length > 0) {
          allComms = allComms.concat(sub.commissions.map(comm => ({ 
            main_module_id: mainModuleId, 
            module_id: module.id, 
            sub_module_id: sub.id, 
            commission_id: comm.id 
          })));
        }
      });
    });

    if (selectAll) {
      setSelectedCommissions(prev => ([
        ...prev,
        ...allComms.filter(nc => !prev.some(sc => 
          sc.main_module_id === nc.main_module_id && 
          sc.module_id === nc.module_id && 
          sc.sub_module_id === nc.sub_module_id && 
          sc.commission_id === nc.commission_id
        ))
      ]));
    } else {
      setSelectedCommissions(prev => prev.filter(sc => 
        !allComms.some(nc => 
          nc.main_module_id === sc.main_module_id && 
          nc.module_id === sc.module_id && 
          nc.sub_module_id === sc.sub_module_id && 
          nc.commission_id === sc.commission_id
        )
      ));
    }
  };

  const isAllMainModuleSelected = (mainModuleId) => {
    // Find the main module and get all its modules
    const mainModule = mainModules.find(mm => mm.id === mainModuleId);
    if (!mainModule || !mainModule.modules) return false;
    
    let allComms = [];
    mainModule.modules.forEach(module => {
      (module.sub_modules || []).forEach(sub => {
        if (sub.commissions && sub.commissions.length > 0) {
          allComms = allComms.concat(sub.commissions.map(comm => ({ 
            main_module_id: mainModuleId, 
            module_id: module.id, 
            sub_module_id: sub.id, 
            commission_id: comm.id 
          })));
        }
      });
    });

    return allComms.length > 0 && allComms.every(nc => 
      selectedCommissions.some(sc => 
        sc.main_module_id === nc.main_module_id && 
        sc.module_id === nc.module_id && 
        sc.sub_module_id === nc.sub_module_id && 
        sc.commission_id === nc.commission_id
      )
    );
  };

  // Helper function to check if a main module has any commissions
  const hasCommissions = (mainModule) => {
    if (!mainModule.modules || mainModule.modules.length === 0) return false;
    
    return mainModule.modules.some(module => {
      if (!module.sub_modules || module.sub_modules.length === 0) return false;
      
      return module.sub_modules.some(sub => {
        return sub.commissions && sub.commissions.length > 0;
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const apiService = ApiService();
      await apiService.vPost('/api/role-module-commissions/delete-all', { role_id: selectedRoleId });
      for (const sel of selectedCommissions) {
        const formData = new FormData();
        formData.append('role_id', selectedRoleId);
        formData.append('main_module_id', sel.main_module_id);
        formData.append('module_id', sel.module_id);
        formData.append('sub_module_id', sel.sub_module_id);
        formData.append('commission_id', sel.commission_id);
        formData.append('status', '1');
        await apiService.vPost('/api/role-module-commissions', formData, true, true);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pageheader mainheading="Role Commission Master" parentfolder="Role Commissions" activepage="Create" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center rounded-top">
              <span className="d-flex align-items-center">
                <i className="bi bi-link-45deg me-2" style={{ fontSize: '1.3rem' }}></i>
                <h5 className="mb-0 fw-semibold">Add Role Commission & Charges</h5>
              </span>
              <Link to="/role-commission/list" className="btn btn-primary text-white d-flex align-items-center">
                <i className="fa fa-list me-1"></i> Role Commission List
              </Link>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} className="row">
                <div className="mb-3 col-md-4">
                  <label htmlFor="roleId" className="form-label">Role</label>
                  <select
                    id="roleId"
                    className="form-select"
                    value={selectedRoleId}
                    onChange={e => setSelectedRoleId(e.target.value)}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3 col-md-4">
                  <label htmlFor="transactionType" className="form-label">Transaction Type</label>
                  <select
                    id="transactionType"
                    className="form-select"
                    value={selectedTransactionType}
                    onChange={e => handleTransactionTypeChange(e.target.value)}
                  >
                    <option value="">All Transaction Types</option>
                    <option value="Commission">Commission</option>
                    <option value="Charge">Charge</option>
                  </select>
                </div>
                <div className="col-md-12">
                  {/* Main Modules with nested Modules and Sub-modules */}
                  <div className="row">
                    {mainModules.filter(mainModule => hasCommissions(mainModule)).map(mainModule => (
                      <div className="col-md-12 mb-4" key={mainModule.id}>
                        <div className="card border-primary h-100 shadow-sm">
                          <div className="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between">
                            <span className="fs-4"><i className="bi bi-stack me-2"></i>{mainModule.name}</span>
                            <div>
                              <input
                                type="checkbox"
                                className="form-check-input me-2"
                                checked={isAllMainModuleSelected(mainModule.id)}
                                onChange={e => handleMainModuleToggle(mainModule.id, !isAllMainModuleSelected(mainModule.id))}
                                id={`main-module-check-${mainModule.id}`}
                              />
                              <label htmlFor={`main-module-check-${mainModule.id}`} className="form-check-label">
                                {isAllMainModuleSelected(mainModule.id) ? 'Deselect All' : 'Select All'}
                              </label>
                            </div>
                          </div>
                          <div className="card-body p-3">
                            <div className="row">
                              {mainModule.modules && mainModule.modules.length > 0 ? (
                                mainModule.modules.filter(module => 
                                  module.sub_modules && module.sub_modules.some(sub => 
                                    sub.commissions && sub.commissions.length > 0
                                  )
                                ).map(module => (
                                  <div className="col-md-4 mb-3" key={module.id}>
                                    <div className="card border-success h-100 shadow-sm">
                                      <div className="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between" style={{borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem'}}>
                                        <span className="fs-6"><i className="bi bi-grid-3x3-gap me-2"></i>{module.name}</span>
                                        <div>
                                          <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            checked={isAllModuleSelected(module)}
                                            onChange={e => handleToggleModule(module, !isAllModuleSelected(module))}
                                            id={`module-check-${module.id}`}
                                          />
                                          <label htmlFor={`module-check-${module.id}`} className="form-check-label">
                                            {isAllModuleSelected(module) ? 'Deselect All' : 'Select All'}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="card-body p-2">
                                        <div className="row g-2">
                                          {module.sub_modules && module.sub_modules.length > 0 ? (
                                            module.sub_modules.filter(sub => 
                                              sub.commissions && sub.commissions.length > 0
                                            ).map(sub => (
                                              <div className="col-md-12 mb-2" key={sub.id}>
                                                <div className="card border-0 bg-light h-100 shadow-sm">
                                                  <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3 border-bottom">
                                                    <span className="fw-semibold text-success"><i className="bi bi-diagram-3 me-1"></i>{sub.name}</span>
                                                    <div>
                                                      <input
                                                        type="checkbox"
                                                        className="form-check-input me-2"
                                                        checked={isAllSubModuleSelected(module.id, sub.id, sub.commissions)}
                                                        onChange={e => handleToggleSubModule(module.id, sub.id, sub.commissions, !isAllSubModuleSelected(module.id, sub.id, sub.commissions))}
                                                        id={`submodule-check-${sub.id}`}
                                                      />
                                                      <label htmlFor={`submodule-check-${sub.id}`} className="form-check-label">
                                                        {isAllSubModuleSelected(module.id, sub.id, sub.commissions) ? 'Deselect All' : 'Select All'}
                                                      </label>
                                                    </div>
                                                  </div>
                                                  <div className="card-body py-2 px-3">
                                                    {sub.commissions && sub.commissions.length > 0 ? (
                                                      <div className="row g-1">
                                                        {sub.commissions.map(comm => (
                                                          <div className="col-12" key={comm.id}>
                                                            <div className="form-check">
                                                              <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`comm-check-${sub.id}-${comm.id}`}
                                                                checked={isCommissionChecked(module.id, sub.id, comm.id)}
                                                                onChange={e => handleCommissionCheck(module.id, sub.id, comm.id, e.target.checked)}
                                                              />
                                                              <label htmlFor={`comm-check-${sub.id}-${comm.id}`} className="form-check-label">
                                                                <div>
                                                                  <strong>Transaction Type:</strong> {comm.txn_type || "Not Set"}
                                                                  <br /><strong>Mode:</strong> {comm.mode === "0" ? "Not Slab" : "Slab"}
                                                                  {comm.mode !== "0" && (
                                                                    <>
                                                                      <br /><strong>Start Amount:</strong> {comm.from_amt ?? "-"}
                                                                      <br /><strong>End Amount:</strong> {comm.to_amt ?? "-"}
                                                                    </>
                                                                  )}
                                                                  <br /><strong>Type:</strong> {comm.commission_type === "1" ? "Percentage %" : "Flat"}
                                                                  <br /><strong>Commission:</strong> {comm.commission}
                                                                </div>
                                                              </label>
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    ) : <div className="text-muted">No commissions found.</div>}
                                                  </div>
                                                </div>
                                              </div>
                                            ))
                                          ) : <div className="text-muted">No submodules found.</div>}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : <div className="text-muted">No modules found.</div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {mainModules.filter(mainModule => hasCommissions(mainModule)).length === 0 && (
                    <div className="col-md-12">
                      <div className="alert alert-info text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        No commission data available for the selected transaction type.
                      </div>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary w-100 text-white mt-3" disabled={loading}>
                  {loading ? 'Saving...' : <><i className="bi bi-plus-circle me-1"></i> Save Role Commissions</>}
                </button>
                {success && <div className="alert alert-success mt-3">Role Commissions saved successfully!</div>}
                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default AddRoleCommission;