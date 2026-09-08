import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';

const AddUserRolePermission = () => {
  const [users, setUsers] = useState([]);
  const [mainModules, setMainModules] = useState([]); // main modules with modules, sub-modules, and permissions
  const [permissions, setPermissions] = useState({}); // { subModuleId: [permissions] }
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]); // [{main_module_id, module_id, sub_module_id, permission_id}]
  const [userSearch, setUserSearch] = useState('');

  // On mount, fetch all users and the main modules with their hierarchy
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        // Fetch users
        const userRes = await apiService.vGet('/api/users');
        if (userRes.data.status === 1) setUsers(userRes.data.users || []);

        // Fetch main modules and build the hierarchy
        const mainModRes = await apiService.vGet('/api/main-modules');
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

  // When user changes, fetch only their assigned permissions
  useEffect(() => {
    if (!userId || mainModules.length === 0) {
      setSelectedPermissions([]);
      return;
    }
    const fetchUserPermissions = async () => {
      try {
        const apiService = ApiService();
        // Use the new API endpoint for all user permissions
        const assignedRes = await apiService.vPost(`/api/user-role-permissions/permissions`, { user_id: userId });
        if (assignedRes.data && assignedRes.data.status === 1) {
          const selected = (assignedRes.data.permissions || []).map(item => {
            // Handle the case where main_module_id might not be in the response
            // We need to find the main_module_id based on the module_id
            let mainModuleId = null;

            // Search through mainModules to find the main_module_id for this module_id
            for (const mainModule of mainModules) {
              for (const module of mainModule.modules || []) {
                if (module.id === parseInt(item.module_id)) {
                  mainModuleId = mainModule.id;
                  break;
                }
              }
              if (mainModuleId) break;
            }

            const result = {
              main_module_id: mainModuleId || parseInt(item.main_module_id || 0),
              module_id: parseInt(item.module_id),
              sub_module_id: parseInt(item.sub_module_id),
              permission_id: parseInt(item.permission_id)
            };

            if (!mainModuleId) {
              console.warn('Could not find main_module_id for permission:', item);
            }

            return result;
          }).filter(item => item.main_module_id); // Filter out items without main_module_id

          console.log(`Loaded ${selected.length} permissions for user ${userId}:`, selected);
          setSelectedPermissions(selected);
        } else {
          setSelectedPermissions([]);
        }
      } catch (err) {
        console.error('Error fetching user permissions:', err);
        setSelectedPermissions([]);
      }
    };
    fetchUserPermissions();
  }, [userId, mainModules]);

  // Handle permission checkbox
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

  // Check if a permission is selected
  const isPermissionChecked = (mainModuleId, moduleId, subModuleId, permissionId) => {
    const mainModId = parseInt(mainModuleId);
    const modId = parseInt(moduleId);
    const subModId = parseInt(subModuleId);
    const permId = parseInt(permissionId);

    // Validate that all IDs are valid numbers
    if (isNaN(mainModId) || isNaN(modId) || isNaN(subModId) || isNaN(permId)) {
      return false;
    }

    const result = selectedPermissions.some(sp =>
      sp.main_module_id === mainModId &&
      sp.module_id === modId &&
      sp.sub_module_id === subModId &&
      sp.permission_id === permId
    );

    // Debug log to help troubleshoot
    if (selectedPermissions.length > 0 && permId === 1) { // Only log for first permission to avoid spam
      console.log(`Checking permission ${mainModId}-${modId}-${subModId}-${permId}:`, result);
      console.log('Available permissions:', selectedPermissions);
    }

    return result;
  };

  // Toggle all permissions for a submodule
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
        // Add all permissions for this submodule that are not already selected
        const newPerms = perms
          .filter(perm => !prev.some(sp => sp.main_module_id === mainModId && sp.module_id === modId && sp.sub_module_id === subModId && sp.permission_id === perm.id))
          .map(perm => ({ main_module_id: mainModId, module_id: modId, sub_module_id: subModId, permission_id: perm.id }));
        return [...prev, ...newPerms];
      });
    } else {
      setSelectedPermissions(prev => prev.filter(sp => !(sp.main_module_id === mainModId && sp.module_id === modId && sp.sub_module_id === subModId)));
    }
  };

  // Toggle all permissions for a module (all submodules)
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
        // Add all permissions for this module that are not already selected
        const newPerms = allPerms.filter(np => !prev.some(sp => sp.main_module_id === np.main_module_id && sp.module_id === np.module_id && sp.sub_module_id === np.sub_module_id && sp.permission_id === np.permission_id));
        return [...prev, ...newPerms];
      });
    } else {
      setSelectedPermissions(prev => prev.filter(sp => !allPerms.some(np => np.main_module_id === sp.main_module_id && np.module_id === sp.module_id && np.sub_module_id === sp.sub_module_id && np.permission_id === sp.permission_id)));
    }
  };

  // Toggle all permissions for a main module
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

  // Check if all permissions for a module are selected
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

  // Check if all permissions for a submodule are selected
  const isAllSubModuleSelected = (mainModuleId, moduleId, subModuleId, perms) => {
    const mainModId = parseInt(mainModuleId);
    const modId = parseInt(moduleId);
    const subModId = parseInt(subModuleId);

    return perms && perms.length > 0 && perms.every(perm => selectedPermissions.some(sp => sp.main_module_id === mainModId && sp.module_id === modId && sp.sub_module_id === subModId && sp.permission_id === perm.id));
  };

  // Check if all permissions for a main module are selected
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



  const handleAssignToAllUser = async () => {
    if (!window.confirm('Are you sure you want to assign permissions to ALL users based on their roles? This process might take a while.')) {
      return;
    }

    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/user-role-permissions/assign-to-all');

      if (response.data.status === 1) {
        setSuccess(true);
        alert(response.data.message);
      } else {
        setError('Failed to assign permissions.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const apiService = ApiService();
      // First, delete all permissions for this user
      await apiService.vPost('/api/user-role-permissions/delete-all', { user_id: userId });
      // Get role_id for the selected user
      const selectedUser = users.find(u => u.id == userId);
      const roleId = selectedUser ? selectedUser.role : '';
      // Then, insert selected permissions
      for (const sel of selectedPermissions) {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('role_id', roleId);
        formData.append('main_module_id', sel.main_module_id);
        formData.append('module_id', sel.module_id);
        formData.append('sub_module_id', sel.sub_module_id);
        formData.append('permission_id', sel.permission_id);
        formData.append('status', '1');
        await apiService.vPost('/api/user-role-permissions', formData, true, true);
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
      <Pageheader mainheading="User Role Permission" parentfolder="User Permissions" activepage="Create" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">

            <div className="col-md-12">
              <div className="card">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit} className="row">
                    <div className="row">
                      <div className="mb-3 col-md-3">
                        <label htmlFor="userSearch" className="form-label">SEARCH</label>
                        <input
                          type="text"
                          id="userSearch"
                          className="form-control"
                          placeholder="Name, Role, MID..."
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                        />
                      </div>
                      <div className="mb-3 col-md-3">
                        <label htmlFor="userId" className="form-label">USERS</label>
                        <select
                          id="userId"
                          className="form-select"
                          value={userId}
                          onChange={e => setUserId(e.target.value)}
                          required
                        >
                          <option value="">Select User</option>
                          {users
                            .filter(user =>
                              `${user.name} ${user.role_name || ''} ${user.mid || ''}`.toLowerCase().includes(userSearch.toLowerCase())
                            )
                            .map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name} [{user.mid}] {user.role_name ? `(Role: ${user.role_name})` : ''}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="mb-3 col-md-3">
                        <span
                          id="transactionType"
                          className="btn btn-info mt-3"
                          onClick={handleAssignToAllUser}
                        >Assign to All User
                        </span>
                      </div>
                    </div>
                    {/* Main Module > Module > Submodule > Permission UI */}
                    <div className="row">
                      {mainModules.filter(mainModule => hasPermissions(mainModule)).map(mainModule => (
                        <div className="col-md-12 mb-4" key={mainModule.id}>
                          <div className="card border-primary h-100 shadow-sm">
                            <div className="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between" style={{ borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
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
                                        <div className="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between" style={{ borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
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
                        {loading ? 'Saving...' : <><i className="bi bi-plus-circle me-1"></i> Save User Role Permissions</>}
                      </button>
                    )}
                    {success && <div className="alert alert-success mt-3">User Role Permissions saved successfully!</div>}
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

export default AddUserRolePermission;
