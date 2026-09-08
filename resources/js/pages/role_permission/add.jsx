import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const AddRolePermission = () => {
  const [roles, setRoles] = useState([]);
  const [mainModules, setMainModules] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]); // [{main_module_id, module_id, sub_module_id, permission_id}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        const [roleRes, mainModRes] = await Promise.all([
          apiService.vGet('/api/roles'),
          apiService.vGet('/api/main-modules'),
        ]);
        if (roleRes.data.status === 1) setRoles(roleRes.data.roles || []);
        if (mainModRes.data.status === 1) {
          // Fetch modules and their sub-modules and permissions for each main module
          const mainModulesWithData = await Promise.all(
            (mainModRes.data.modules || []).map(async (mainModule) => {
              try {
                // Get modules for this main module
                const modulesRes = await apiService.vGet(`/api/modules/by-main-module/${mainModule.id}`);
                const modules = modulesRes.data.modules || [];
                
                // For each module, get sub-modules and their permissions
                const modulesWithSubModules = await Promise.all(
                  modules.map(async (module) => {
                    try {
                      // Get sub-modules for this module
                      const subModulesRes = await apiService.vGet(`/api/modules/${module.id}/sub-modules`);
                      const subModules = subModulesRes.data.sub_modules || [];
                      
                      // For each sub-module, get permissions
                      const subModulesWithPermissions = await Promise.all(
                        subModules.map(async (subModule) => {
                          try {
                            const permissionsRes = await apiService.vGet(`/api/sub-modules/${subModule.id}/permissions`);
                            return {
                              ...subModule,
                              permissions: permissionsRes.data.permissions || []
                            };
                          } catch (err) {
                            return {
                              ...subModule,
                              permissions: []
                            };
                          }
                        })
                      );
                      
                      return {
                        ...module,
                        sub_modules: subModulesWithPermissions
                      };
                    } catch (err) {
                      return {
                        ...module,
                        sub_modules: []
                      };
                    }
                  })
                );
                
                return {
                  ...mainModule,
                  modules: modulesWithSubModules
                };
              } catch (err) {
                return {
                  ...mainModule,
                  modules: []
                };
              }
            })
          );
          setMainModules(mainModulesWithData);
        }
      } catch (err) {
        setMainModules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedPermissions([]);
      return;
    }
    // Fetch already assigned permissions for the selected role from role_module_permissions table
    const fetchRolePermissions = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        // Use the list endpoint with role_id filter
        const assignedRes = await apiService.vGet(`/api/role-module-permissions?role_id=${selectedRoleId}`);
        if (assignedRes.data && assignedRes.data.status === 1) {
          // The API should return an array of role_module_permissions
          const selected = (assignedRes.data.role_module_permissions || []).map(item => ({
            main_module_id: parseInt(item.main_module_id),
            module_id: parseInt(item.module_id),
            sub_module_id: parseInt(item.sub_module_id),
            permission_id: parseInt(item.permission_id)
          }));
          setSelectedPermissions(selected);
        } else {
          setSelectedPermissions([]);
        }
      } catch (err) {
        setSelectedPermissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRolePermissions();
  }, [selectedRoleId]);

  const handlePermissionCheck = (mainModuleId, moduleId, subModuleId, permissionId, checked) => {
    const mainModId = parseInt(mainModuleId);
    const modId = parseInt(moduleId);
    const subModId = parseInt(subModuleId);
    const permId = parseInt(permissionId);
    
    // Validate that all IDs are valid numbers
    if (isNaN(mainModId) || isNaN(modId) || isNaN(subModId) || isNaN(permId)) {
      console.error('Invalid IDs detected:', { mainModuleId, moduleId, subModuleId, permissionId });
      return;
    }
    
    if (checked) {
      setSelectedPermissions(prev => ([...prev, { main_module_id: mainModId, module_id: modId, sub_module_id: subModId, permission_id: permId }]));
    } else {
      setSelectedPermissions(prev => prev.filter(sp => !(sp.main_module_id === mainModId && sp.module_id === modId && sp.sub_module_id === subModId && sp.permission_id === permId)));
    }
  };

  const isPermissionChecked = (mainModuleId, moduleId, subModuleId, permissionId) => {
    const mainModId = parseInt(mainModuleId);
    const modId = parseInt(moduleId);
    const subModId = parseInt(subModuleId);
    const permId = parseInt(permissionId);
    
    return selectedPermissions.some(sp => sp.main_module_id === mainModId && sp.module_id === modId && sp.sub_module_id === subModId && sp.permission_id === permId);
  };

  const handleToggleSubModule = (mainModuleId, moduleId, subModuleId, perms, selectAll) => {
    const mainModId = parseInt(mainModuleId);
    const modId = parseInt(moduleId);
    const subModId = parseInt(subModuleId);
    
    // Validate that all IDs are valid numbers
    if (isNaN(mainModId) || isNaN(modId) || isNaN(subModId)) {
      console.error('Invalid IDs detected:', { mainModuleId, moduleId, subModuleId });
      return;
    }
    
    if (selectAll) {
      setSelectedPermissions(prev => {
        const newPerms = perms
          .filter(perm => !prev.some(sp => sp.main_module_id === mainModId && sp.module_id === modId && sp.sub_module_id === subModId && sp.permission_id === perm.id))
          .map(perm => ({ main_module_id: mainModId, module_id: modId, sub_module_id: subModId, permission_id: perm.id }));
        return [...prev, ...newPerms];
      });
    } else {
      setSelectedPermissions(prev => prev.filter(sp => !(sp.main_module_id === mainModId && sp.module_id === modId && sp.sub_module_id === subModId)));
    }
  };

  const handleToggleModule = (mainModuleId, module, selectAll) => {
    const mainModId = parseInt(mainModuleId);
    
    // Validate that mainModuleId is a valid number
    if (isNaN(mainModId)) {
      console.error('Invalid main module ID:', mainModuleId);
      return;
    }
    
    let allPerms = [];
    (module.sub_modules || []).forEach(sub => {
      if (sub.permissions && sub.permissions.length > 0) {
        allPerms = allPerms.concat(sub.permissions.map(perm => ({ main_module_id: mainModId, module_id: module.id, sub_module_id: sub.id, permission_id: perm.id })));
      }
    });
    if (selectAll) {
      setSelectedPermissions(prev => {
        const newPerms = allPerms.filter(np => !prev.some(sp => sp.main_module_id === np.main_module_id && sp.module_id === np.module_id && sp.sub_module_id === np.sub_module_id && sp.permission_id === np.permission_id));
        return [...prev, ...newPerms];
      });
    } else {
      setSelectedPermissions(prev => prev.filter(sp => !allPerms.some(np => np.main_module_id === sp.main_module_id && np.module_id === sp.module_id && np.sub_module_id === sp.sub_module_id && np.permission_id === sp.permission_id)));
    }
  };

  const handleToggleMainModule = (mainModule, selectAll) => {
    let allPerms = [];
    (mainModule.modules || []).forEach(module => {
      (module.sub_modules || []).forEach(sub => {
        if (sub.permissions && sub.permissions.length > 0) {
          allPerms = allPerms.concat(sub.permissions.map(perm => ({ main_module_id: mainModule.id, module_id: module.id, sub_module_id: sub.id, permission_id: perm.id })));
        }
      });
    });
    if (selectAll) {
      setSelectedPermissions(prev => {
        const newPerms = allPerms.filter(np => !prev.some(sp => sp.main_module_id === np.main_module_id && sp.module_id === np.module_id && sp.sub_module_id === np.sub_module_id && sp.permission_id === np.permission_id));
        return [...prev, ...newPerms];
      });
    } else {
      setSelectedPermissions(prev => prev.filter(sp => !allPerms.some(np => np.main_module_id === sp.main_module_id && np.module_id === sp.module_id && np.sub_module_id === sp.sub_module_id && np.permission_id === sp.permission_id)));
    }
  };

  const isAllModuleSelected = (mainModuleId, module) => {
    const mainModId = parseInt(mainModuleId);
    
    let allPerms = [];
    (module.sub_modules || []).forEach(sub => {
      if (sub.permissions && sub.permissions.length > 0) {
        allPerms = allPerms.concat(sub.permissions.map(perm => ({ main_module_id: mainModId, module_id: module.id, sub_module_id: sub.id, permission_id: perm.id })));
      }
    });
    return allPerms.length > 0 && allPerms.every(np => selectedPermissions.some(sp => sp.main_module_id === np.main_module_id && sp.module_id === np.module_id && sp.sub_module_id === np.sub_module_id && sp.permission_id === np.permission_id));
  };

  const isAllSubModuleSelected = (mainModuleId, moduleId, subModuleId, perms) => {
    const mainModId = parseInt(mainModuleId);
    const modId = parseInt(moduleId);
    const subModId = parseInt(subModuleId);
    
    return perms && perms.length > 0 && perms.every(perm => selectedPermissions.some(sp => sp.main_module_id === mainModId && sp.module_id === modId && sp.sub_module_id === subModId && sp.permission_id === perm.id));
  };

  const isAllMainModuleSelected = (mainModule) => {
    let allPerms = [];
    (mainModule.modules || []).forEach(module => {
      (module.sub_modules || []).forEach(sub => {
        if (sub.permissions && sub.permissions.length > 0) {
          allPerms = allPerms.concat(sub.permissions.map(perm => ({ main_module_id: mainModule.id, module_id: module.id, sub_module_id: sub.id, permission_id: perm.id })));
        }
      });
    });
    return allPerms.length > 0 && allPerms.every(np => selectedPermissions.some(sp => sp.main_module_id === np.main_module_id && sp.module_id === np.module_id && sp.sub_module_id === np.sub_module_id && sp.permission_id === np.permission_id));
  };

  // Helper function to check if a main module has any permissions
  const hasPermissions = (mainModule) => {
    if (!mainModule.modules || mainModule.modules.length === 0) return false;
    
    return mainModule.modules.some(module => {
      if (!module.sub_modules || module.sub_modules.length === 0) return false;
      
      return module.sub_modules.some(sub => {
        return sub.permissions && sub.permissions.length > 0;
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    // Debug: Log the selected permissions to see what we're working with
    console.log('Selected permissions:', selectedPermissions);
    
    try {
      const apiService = ApiService();
      // First, delete all permissions for this role
      await apiService.vPost('/api/role-module-permissions/delete-all', { role_id: selectedRoleId });
      
      // Filter out any invalid permissions and then insert selected permissions
      const validPermissions = selectedPermissions.filter(sel => {
        const isValid = !isNaN(sel.main_module_id) && !isNaN(sel.module_id) && !isNaN(sel.sub_module_id) && !isNaN(sel.permission_id);
        if (!isValid) {
          console.error('Invalid permission detected:', sel);
        }
        return isValid;
      });
      
      for (const sel of validPermissions) {
        const formData = new FormData();
        formData.append('role_id', selectedRoleId);
        formData.append('main_module_id', String(sel.main_module_id));
        formData.append('module_id', String(sel.module_id));
        formData.append('sub_module_id', String(sel.sub_module_id));
        formData.append('permission_id', String(sel.permission_id));
        formData.append('status', '1');
        await apiService.vPost('/api/role-module-permissions', formData, true, true);
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
      <Pageheader mainheading="Role Permission Master" parentfolder="Role Permissions" activepage="Create" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center rounded-top">
              <span className="d-flex align-items-center">
                <i className="bi bi-link-45deg me-2" style={{ fontSize: '1.3rem' }}></i>
                <h5 className="mb-0 fw-semibold">Add Role Permission</h5>
              </span>
              <Link to="/role-permission/list" className="btn btn-primary text-white d-flex align-items-center">
                <i className="fa fa-list me-1"></i> Role Permission List
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
                <div className="col-md-12">
                  <div className="row">
                    {mainModules.filter(mainModule => hasPermissions(mainModule)).map(mainModule => (
                      <div className="col-md-12 mb-4" key={mainModule.id}>
                        <div className="card border-primary h-100 shadow-sm">
                          <div className="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between" >
                            <span className="fs-4"><i className="bi bi-stack me-2"></i>{mainModule.name}</span>
                            <div>
                              <input
                                type="checkbox"
                                className="form-check-input me-2"
                                checked={isAllMainModuleSelected(mainModule)}
                                onChange={e => handleToggleMainModule(mainModule, !isAllMainModuleSelected(mainModule))}
                                id={`main-module-check-${mainModule.id}`}
                              />
                              <label htmlFor={`main-module-check-${mainModule.id}`} className="form-check-label">
                                {isAllMainModuleSelected(mainModule) ? 'Deselect All' : 'Select All'}
                              </label>
                            </div>
                          </div>
                          <div className="card-body p-3">
                            <div className="row">
                              {mainModule.modules && mainModule.modules.length > 0 ? (
                                mainModule.modules.filter(module => 
                                  module.sub_modules && module.sub_modules.some(sub => 
                                    sub.permissions && sub.permissions.length > 0
                                  )
                                ).map(module => (
                                  <div className="col-md-6 mb-3" key={module.id}>
                                    <div className="card border-success h-100 shadow-sm">
                                      <div className="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between" style={{borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem'}}>
                                        <span className="fs-6"><i className="bi bi-grid-3x3-gap me-2"></i>{module.name}</span>
                                        <div>
                                          <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            checked={isAllModuleSelected(mainModule.id, module)}
                                            onChange={e => handleToggleModule(mainModule.id, module, !isAllModuleSelected(mainModule.id, module))}
                                            id={`module-check-${module.id}`}
                                          />
                                          <label htmlFor={`module-check-${module.id}`} className="form-check-label">
                                            {isAllModuleSelected(mainModule.id, module) ? 'Deselect All' : 'Select All'}
                                          </label>
                                        </div>
                                      </div>
                                      <div className="card-body p-2">
                                        <div className="row g-2">
                                          {module.sub_modules && module.sub_modules.length > 0 ? (
                                            module.sub_modules.filter(sub => 
                                              sub.permissions && sub.permissions.length > 0
                                            ).map(sub => (
                                              <div className="col-md-12 mb-2" key={sub.id}>
                                                <div className="card border-0 bg-light h-100 shadow-sm">
                                                  <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3 border-bottom">
                                                    <span className="fw-semibold text-success"><i className="bi bi-diagram-3 me-1"></i>{sub.name}</span>
                                                    <div>
                                                      <input
                                                        type="checkbox"
                                                        className="form-check-input me-2"
                                                        checked={isAllSubModuleSelected(mainModule.id, module.id, sub.id, sub.permissions)}
                                                        onChange={e => handleToggleSubModule(mainModule.id, module.id, sub.id, sub.permissions, !isAllSubModuleSelected(mainModule.id, module.id, sub.id, sub.permissions))}
                                                        id={`submodule-check-${sub.id}`}
                                                      />
                                                      <label htmlFor={`submodule-check-${sub.id}`} className="form-check-label">
                                                        {isAllSubModuleSelected(mainModule.id, module.id, sub.id, sub.permissions) ? 'Deselect All' : 'Select All'}
                                                      </label>
                                                    </div>
                                                  </div>
                                                  <div className="card-body py-2 px-3">
                                                    {sub.permissions && sub.permissions.length > 0 ? (
                                                      <div className="row g-1">
                                                        {sub.permissions.map(perm => (
                                                          <div className="col-12" key={perm.id}>
                                                            <div className="form-check">
                                                              <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`perm-check-${sub.id}-${perm.id}`}
                                                                checked={isPermissionChecked(mainModule.id, module.id, sub.id, perm.id)}
                                                                onChange={e => handlePermissionCheck(mainModule.id, module.id, sub.id, perm.id, e.target.checked)}
                                                              />
                                                              <label htmlFor={`perm-check-${sub.id}-${perm.id}`} className="form-check-label">{perm.name}</label>
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    ) : <div className="text-muted">No permissions found.</div>}
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
                  {mainModules.filter(mainModule => hasPermissions(mainModule)).length === 0 && (
                    <div className="col-md-12">
                      <div className="alert alert-info text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        No permission data available. Please add main modules, modules, sub-modules, and permissions first.
                      </div>
                    </div>
                  )}
                </div>
                {mainModules.filter(mainModule => hasPermissions(mainModule)).length > 0 && (
                  <button type="submit" className="btn btn-primary w-100 text-white mt-3" disabled={loading}>
                    {loading ? 'Saving...' : <><i className="bi bi-plus-circle me-1"></i> Save Role Permissions</>}
                  </button>
                )}
                {success && <div className="alert alert-success mt-3">Role Permissions saved successfully!</div>}
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

export default AddRolePermission;
