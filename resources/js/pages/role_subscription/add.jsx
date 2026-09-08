import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddRoleSubscription = () => {
  const [roles, setRoles] = useState([]);
  const [mainModules, setMainModules] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [subscriptionPlans, setSubscriptionPlans] = useState({});
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]); // [{main_module_id, module_id, plan_id}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        
        // Fetch roles and main modules data for current session user
        const rolesResponse = await apiService.vGet('/api/role-subscription');
        
        if (rolesResponse.data.status === 1) {
          setRoles(rolesResponse.data.roles);
          setMainModules(rolesResponse.data.mainModules);
        } else {
          setError(rolesResponse.data.message || 'Failed to fetch roles data');
          return; // Exit early if roles fetch fails
        }

        // Fetch subscription plans - this should also be filtered by session user
        const subscriptionsResponse = await apiService.vGet('/api/subscription-masters');
        
        // Process subscription plans data
        if (subscriptionsResponse.data.status === 1) {
          const plansByModule = {};
          (subscriptionsResponse.data.data || []).forEach(plan => {
            const key = `${plan.main_module_id}-${plan.module_id}`;
            if (!plansByModule[key]) {
              plansByModule[key] = [];
            }
            plansByModule[key].push({
              id: plan.id,
              title: `${plan.duration} ${plan.duration_type}`,
              price: plan.price,
              description: plan.description
            });
          });
          setSubscriptionPlans(plansByModule);
        } else {
          console.warn('Failed to fetch subscription plans:', subscriptionsResponse.data.message);
          setSubscriptionPlans({}); // Set empty object if fetch fails
        }
      } catch (err) {
        setError('Failed to fetch data. Please check your session and try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedSubscriptions([]);
      return;
    }
    
    // Fetch already assigned subscriptions for the selected role (filtered by current session user)
    const fetchRoleSubscriptions = async () => {
      setLoading(true);
      try {
        const apiService = ApiService();
        const response = await apiService.vGet(`/api/role-subscription/${selectedRoleId}`);
        
        if (response.data.status === 1) {
          const existingSubscriptions = [];
          
          console.log('Available subscription plans:', subscriptionPlans);
          console.log('Role subscriptions from API:', response.data.subscriptions);
          
          (response.data.subscriptions || []).forEach(roleSub => {
            // Find matching subscription plan from subscriptionPlans
            const key = `${roleSub.main_module_id}-${roleSub.module_id}`;
            const plans = subscriptionPlans[key] || [];
            
            console.log(`Looking for plans with key: ${key}`, plans);
            
            // Find the plan that matches duration and duration_type
            const matchingPlan = plans.find(plan => {
              const planTitle = plan.title.toLowerCase();
              const roleSubDuration = `${roleSub.duration} ${roleSub.duration_type.toLowerCase()}`;
              const matches = planTitle === roleSubDuration;
              
              console.log(`Comparing plan "${planTitle}" with role sub "${roleSubDuration}": ${matches}`);
              return matches;
            });
            
            if (matchingPlan) {
              existingSubscriptions.push({
                main_module_id: parseInt(roleSub.main_module_id),
                module_id: parseInt(roleSub.module_id),
                plan_id: parseInt(matchingPlan.id)
              });
              console.log(`Matched role subscription:`, roleSub, 'with plan:', matchingPlan);
            } else {
              console.warn('No matching plan found for role subscription:', roleSub);
            }
          });
          
          setSelectedSubscriptions(existingSubscriptions);
          console.log(`Loaded ${existingSubscriptions.length} existing subscriptions for role ${selectedRoleId}:`, existingSubscriptions);
        } else {
          console.warn('No existing subscriptions found for role:', selectedRoleId);
          setSelectedSubscriptions([]);
        }
      } catch (err) {
        console.error('Error fetching role subscriptions:', err);
        setSelectedSubscriptions([]);
        // Don't show error to user for this as it might be normal (no existing subscriptions)
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoleSubscriptions();
  }, [selectedRoleId, subscriptionPlans]); // Added subscriptionPlans as dependency

  const handleSubscriptionCheck = (mainModuleId, moduleId, planId, checked) => {
    const mainModId = parseInt(mainModuleId);
    const modId = parseInt(moduleId);
    const plId = parseInt(planId);
    
    // Validate that all IDs are valid numbers
    if (isNaN(mainModId) || isNaN(modId) || isNaN(plId)) {
      console.error('Invalid IDs detected:', { mainModuleId, moduleId, planId });
      return;
    }
    
    if (checked) {
      setSelectedSubscriptions(prev => ([
        ...prev, 
        { main_module_id: mainModId, module_id: modId, plan_id: plId }
      ]));
    } else {
      setSelectedSubscriptions(prev => prev.filter(sub => 
        !(sub.main_module_id === mainModId && sub.module_id === modId && sub.plan_id === plId)
      ));
    }
  };

  const isSubscriptionChecked = (mainModuleId, moduleId, planId) => {
    const mainModId = parseInt(mainModuleId);
    const modId = parseInt(moduleId);
    const plId = parseInt(planId);
    
    return selectedSubscriptions.some(sub => 
      sub.main_module_id === mainModId && 
      sub.module_id === modId && 
      sub.plan_id === plId
    );
  };

  const handleToggleModule = (mainModuleId, module, plans, selectAll) => {
    const mainModId = parseInt(mainModuleId);
    
    // Validate that mainModuleId is a valid number
    if (isNaN(mainModId)) {
      console.error('Invalid main module ID:', mainModuleId);
      return;
    }
    
    if (selectAll) {
      // Add all plans for this module
      const newSubscriptions = plans.map(plan => ({
        main_module_id: mainModId,
        module_id: parseInt(module.id),
        plan_id: parseInt(plan.id)
      }));
      
      setSelectedSubscriptions(prev => {
        // Remove existing subscriptions for this module first
        const filtered = prev.filter(sub => 
          !(sub.main_module_id === mainModId && sub.module_id === parseInt(module.id))
        );
        return [...filtered, ...newSubscriptions];
      });
    } else {
      // Remove all subscriptions for this module
      setSelectedSubscriptions(prev => prev.filter(sub => 
        !(sub.main_module_id === mainModId && sub.module_id === parseInt(module.id))
      ));
    }
  };

  const handleToggleMainModule = (mainModule, selectAll) => {
    let allSubscriptions = [];
    (mainModule.modules || []).forEach(module => {
      // Get subscription plans for this module
      const plans = getSubscriptionPlans(mainModule.id, module.id);
      plans.forEach(plan => {
        allSubscriptions.push({
          main_module_id: parseInt(mainModule.id),
          module_id: parseInt(module.id),
          plan_id: parseInt(plan.id)
        });
      });
    });
    
    if (selectAll) {
      setSelectedSubscriptions(prev => {
        // Remove existing subscriptions for this main module first
        const filtered = prev.filter(sub => sub.main_module_id !== parseInt(mainModule.id));
        return [...filtered, ...allSubscriptions];
      });
    } else {
      // Remove all subscriptions for this main module
      setSelectedSubscriptions(prev => prev.filter(sub => 
        sub.main_module_id !== parseInt(mainModule.id)
      ));
    }
  };

  const isAllModuleSelected = (mainModuleId, module) => {
    const mainModId = parseInt(mainModuleId);
    const plans = getSubscriptionPlans(mainModuleId, module.id);
    
    return plans.length > 0 && plans.every(plan => 
      selectedSubscriptions.some(sub => 
        sub.main_module_id === mainModId && 
        sub.module_id === parseInt(module.id) && 
        sub.plan_id === parseInt(plan.id)
      )
    );
  };

  const isAllMainModuleSelected = (mainModule) => {
    let allSubscriptions = [];
    (mainModule.modules || []).forEach(module => {
      const plans = getSubscriptionPlans(mainModule.id, module.id);
      plans.forEach(plan => {
        allSubscriptions.push({
          main_module_id: parseInt(mainModule.id),
          module_id: parseInt(module.id),
          plan_id: parseInt(plan.id)
        });
      });
    });
    
    return allSubscriptions.length > 0 && allSubscriptions.every(sub => 
      selectedSubscriptions.some(selected => 
        selected.main_module_id === sub.main_module_id && 
        selected.module_id === sub.module_id && 
        selected.plan_id === sub.plan_id
      )
    );
  };

  // Get subscription plans for a specific main module and module
  const getSubscriptionPlans = (mainModuleId, moduleId) => {
    const key = `${mainModuleId}-${moduleId}`;
    return subscriptionPlans[key] || [];
  };

  // Helper function to check if a main module has any subscription plans
  const hasSubscriptionPlans = (mainModule) => {
    if (!mainModule.modules || mainModule.modules.length === 0) return false;
    
    return mainModule.modules.some(module => {
      const plans = getSubscriptionPlans(mainModule.id, module.id);
      return plans && plans.length > 0;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    // Validate that we have selected subscriptions
    if (selectedSubscriptions.length === 0) {
      setError('Please select at least one subscription plan.');
      setLoading(false);
      return;
    }
    
    // Debug: Log the selected subscriptions to see what we're working with
    console.log('Selected subscriptions:', selectedSubscriptions);
    console.log('Selected role ID:', selectedRoleId);
    
    try {
      const apiService = ApiService();
      
      // Validate subscription data before sending
      const validatedSubscriptions = selectedSubscriptions.filter(sub => {
        const isValid = !isNaN(sub.main_module_id) && !isNaN(sub.module_id) && !isNaN(sub.plan_id);
        if (!isValid) {
          console.error('Invalid subscription detected:', sub);
        }
        return isValid;
      });
      
      if (validatedSubscriptions.length === 0) {
        setError('No valid subscription plans selected.');
        return;
      }
      
      const response = await apiService.vPost('/api/role-subscription', {
        role_id: parseInt(selectedRoleId),
        subscriptions: validatedSubscriptions.map(sub => ({
          main_module_id: sub.main_module_id,
          module_id: sub.module_id,
          subscription_master_id: sub.plan_id // Send as subscription_master_id
        }))
      });
      
      if (response.data.status === 1) {
        setSuccess(true);
        setError(null);
        console.log('Role subscriptions saved successfully');
        
        // Reset form after successful submission
        setTimeout(() => {
          setSuccess(false);
          setSelectedSubscriptions([]);
          setSelectedRoleId('');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to save role subscriptions');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response && err.response.status === 403) {
        setError('You do not have permission to perform this action.');
      } else {
        setError('Failed to save role subscriptions. Please try again.');
      }
      console.error('Error saving role subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pageheader mainheading="Role Subscription Master" parentfolder="Role Subscriptions" activepage="Create" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          
          <div className="col-md-12">
            <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center rounded-top">
              <span className="d-flex align-items-center">
                <i className="bi bi-credit-card me-2" style={{ fontSize: '1.3rem' }}></i>
                <h5 className="mb-0 fw-semibold">Add Role Subscription</h5>
              </span>
              <Link to="/role-subscription/list" className="btn btn-primary text-white d-flex align-items-center">
                <i className="fa fa-list me-1"></i> Role Subscription List
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
                    {mainModules.filter(mainModule => hasSubscriptionPlans(mainModule)).map(mainModule => (
                      <div className="col-md-12 mb-4" key={mainModule.id}>
                        <div className="card border-primary h-100 shadow-sm">
                          <div className="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between">
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
                                mainModule.modules.filter(module => {
                                  const plans = getSubscriptionPlans(mainModule.id, module.id);
                                  return plans && plans.length > 0;
                                }).map(module => {
                                  const plans = getSubscriptionPlans(mainModule.id, module.id);
                                  return (
                                    <div className="col-md-6 mb-3" key={module.id}>
                                      <div className="card border-success h-100 shadow-sm">
                                        <div className="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between" style={{borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem'}}>
                                          <span className="fs-6"><i className="bi bi-grid-3x3-gap me-2"></i>{module.name}</span>
                                          <div>
                                            <input
                                              type="checkbox"
                                              className="form-check-input me-2"
                                              checked={isAllModuleSelected(mainModule.id, module)}
                                              onChange={e => handleToggleModule(mainModule.id, module, plans, !isAllModuleSelected(mainModule.id, module))}
                                              id={`module-check-${module.id}`}
                                            />
                                            <label htmlFor={`module-check-${module.id}`} className="form-check-label">
                                              {isAllModuleSelected(mainModule.id, module) ? 'Deselect All' : 'Select All'}
                                            </label>
                                          </div>
                                        </div>
                                        <div className="card-body p-2">
                                          <div className="row g-2">
                                            {plans && plans.length > 0 ? (
                                              plans.map(plan => (
                                                <div className="col-md-12 mb-2" key={plan.id}>
                                                  <div className="card border-0 bg-light h-100 shadow-sm">
                                                    <div className="card-body py-2 px-3">
                                                      <div className="form-check">
                                                        <input
                                                          type="checkbox"
                                                          className="form-check-input"
                                                          id={`plan-check-${module.id}-${plan.id}`}
                                                          checked={isSubscriptionChecked(mainModule.id, module.id, plan.id)}
                                                          onChange={e => handleSubscriptionCheck(mainModule.id, module.id, plan.id, e.target.checked)}
                                                        />
                                                        <label htmlFor={`plan-check-${module.id}-${plan.id}`} className="form-check-label">
                                                          <span className="fw-semibold text-success">
                                                            <i className="bi bi-credit-card me-1"></i>
                                                            {plan.title}
                                                          </span>
                                                          <span className="text-muted ms-2">- ₹{plan.price}</span>
                                                        </label>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))
                                            ) : <div className="text-muted">No subscription plans found.</div>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : <div className="text-muted">No modules found.</div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {mainModules.filter(mainModule => hasSubscriptionPlans(mainModule)).length === 0 && (
                      <div className="col-md-12">
                        <div className="alert alert-info text-center">
                          <i className="bi bi-info-circle me-2"></i>
                          No subscription plans available. Please add main modules, modules, and subscription plans first.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {mainModules.filter(mainModule => hasSubscriptionPlans(mainModule)).length > 0 && (
                  <button type="submit" className="btn btn-primary w-100 text-white mt-3" disabled={loading}>
                    {loading ? 'Saving...' : <><i className="bi bi-plus-circle me-1"></i> Save Role Subscriptions</>}
                  </button>
                )}
                {success && <div className="alert alert-success mt-3">Role Subscriptions saved successfully!</div>}
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

export default AddRoleSubscription;
