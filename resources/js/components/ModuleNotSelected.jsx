import React, { useEffect, useState } from 'react';
import { useModule } from '../core/hooks/moduleContext';
import './ModuleNotSelected.css';

const ModuleNotSelected = () => {
    const { 
        modules,
        loading,
        error,
        fetchModules,
        setSelectedModule
    } = useModule();

    const [autoLoading, setAutoLoading] = useState(false);

    // Debug: Log module data
    console.log('ModuleNotSelected Debug:', {
        loading,
        modules,
        modulesLength: modules?.length,
        autoLoading,
        error
    });

    // Fetch modules immediately when component loads
    useEffect(() => {
        if (modules.length === 0 && !loading) {
            console.log('Fetching modules because none are available...');
            fetchModules();
        }
    }, [modules.length, loading, fetchModules]);

    // Auto-load first main module (index 0) when modules are available
    // Using same logic as ModuleSelector component
    useEffect(() => {
        if (!loading && modules.length > 0 && !autoLoading) {
            setAutoLoading(true);
            // Add a small delay to avoid jarring transition
            const autoLoadTimer = setTimeout(() => {
                // Select the first module by index (index 0) - same as ModuleSelector logic
                const firstMainModule = modules[0];

                console.log('Available modules:', modules);
                console.log('First main module (index 0):', firstMainModule);
                
                if (firstMainModule) {
                    // Automatically select the first main module using direct context
                    console.log('Auto-loading first main module (index 0):', firstMainModule.name);
                    setSelectedModule({ mainModule: firstMainModule });
                } else {
                    setAutoLoading(false); // No modules found
                }
            }, 1500); // 1.5 second delay to show the welcome message briefly

            return () => {
                clearTimeout(autoLoadTimer);
                setAutoLoading(false);
            };
        }
    }, [loading, modules, setSelectedModule, autoLoading]);

    // Handle quick module selection - same pattern as ModuleSelector
    const handleQuickSelect = (mainModule) => {
        // Using direct context instead of useModuleSelector
        setSelectedModule({ mainModule });
    };

    // Handle toggle selector - create a simple implementation
    const toggleSelector = () => {
        // This would normally open the module selector modal
        // For now, just fetch modules if they're not loaded
        if (modules.length === 0) {
            fetchModules();
        }
    };

    const popularModules = modules
        .filter(module => module.status === 1)
        .slice(0, 6);

    return (
        <div className="module-not-selected">
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-lg-10 col-xl-8">
                        {/* Welcome Section */}
                        <div className="welcome-section text-center mb-5">
                    
                            

                            <h1 className="welcome-title">
                                Welcome to Your
                                <span className="gradient-text"> Digital Workspace</span>
                            </h1>
                            
                            <p className="welcome-subtitle">
                                {loading ? (
                                    <>
                                        Loading your modules and setting up your workspace...
                                        <div className="spinner-border spinner-border-sm ms-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </>
                                ) : autoLoading ? (
                                    <>
                                        Automatically loading your default module...
                                        <div className="spinner-border spinner-border-sm ms-2" role="status">
                                            <span className="visually-hidden">Auto-loading...</span>
                                        </div>
                                    </>
                                ) : modules.length > 0 ? (
                                    `Your modules are ready (${modules.length} modules found). Select one to get started.`
                                ) : (
                                    `No modules available (modules: ${modules?.length || 0}, loading: ${loading}). Please contact your administrator.`
                                )}
                            </p>
                        </div>

                        {/* Main Action */}
                        <div className="main-action-section mb-5">
                            <div className="action-card">
                                <div className="action-content">
                                    <div className="action-icon mb-3">
                                        <iconify-icon icon={loading || autoLoading ? "solar:widget-5-broken" : "solar:widget-add-broken"} class="fs-1"></iconify-icon>
                                    </div>
                                    <h3 className="action-title">
                                        {loading ? "Loading Modules" : autoLoading ? "Auto-Loading Module" : modules.length > 0 ? "Choose Your Module" : "Choose Your Module"}
                                    </h3>
                                    <p className="action-description">
                                        {loading ? (
                                            "Please wait while we load your available modules..."
                                        ) : autoLoading ? (
                                            "Your default module is being loaded automatically. Please wait..."
                                        ) : modules.length > 0 ? (
                                            "Browse through our comprehensive suite of business modules and select the one that matches your current needs."
                                        ) : (
                                            "No modules are currently available for your account."
                                        )}
                                    </p>
                                    {modules.length > 0 && !loading && !autoLoading && (
                                        <button 
                                            className="btn btn-primary btn-lg btn-action"
                                            onClick={toggleSelector}
                                            disabled={loading || autoLoading}
                                        >
                                            <iconify-icon icon="solar:widget-5-broken" class="me-2"></iconify-icon>
                                            Browse All Modules
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Access - Only show if auto-loading fails or modules are available but not auto-selected */}
                        {popularModules.length > 0 && !loading && !autoLoading && (
                            <div className="quick-access-section">
                                <div className="section-header text-center mb-4">
                                    <h4 className="section-title">Quick Access</h4>
                                    <p className="section-subtitle">
                                        Alternative modules available for quick selection
                                    </p>
                                </div>

                                <div className="row g-3">
                                    {popularModules.map((module) => (
                                        <div key={module.id} className="col-lg-4 col-md-6">
                                            <div 
                                                className="quick-module-card"
                                                onClick={() => handleQuickSelect(module)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        handleQuickSelect(module);
                                                    }
                                                }}
                                            >
                                                <div className="module-card-content">
                                                    <div className="module-card-icon">
                                                        <iconify-icon icon={module.icon}></iconify-icon>
                                                    </div>
                                                    <div className="module-card-info">
                                                        <h6 className="module-card-title">{module.name}</h6>
                                                        <p className="module-card-desc">
                                                            {module.description || `Manage your ${module.name.toLowerCase()} operations`}
                                                        </p>
                                                    </div>
                                                    <div className="module-card-arrow">
                                                        <iconify-icon icon="solar:arrow-right-broken"></iconify-icon>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features Overview */}
                        <div className="features-section mt-5">
                            <div className="row g-4">
                                <div className="col-lg-4">
                                    <div className="feature-item text-center">
                                        <div className="feature-icon mb-3">
                                            <iconify-icon icon="solar:shield-check-broken" class="fs-2 text-success"></iconify-icon>
                                        </div>
                                        <h6 className="feature-title">Secure & Reliable</h6>
                                        <p className="feature-desc">
                                            Enterprise-grade security with reliable performance for your business operations.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="feature-item text-center">
                                        <div className="feature-icon mb-3">
                                            <iconify-icon icon="solar:rocket-broken" class="fs-2 text-primary"></iconify-icon>
                                        </div>
                                        <h6 className="feature-title">Lightning Fast</h6>
                                        <p className="feature-desc">
                                            Optimized for speed with modern technology stack for seamless user experience.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="feature-item text-center">
                                        <div className="feature-icon mb-3">
                                            <iconify-icon icon="solar:settings-broken" class="fs-2 text-info"></iconify-icon>
                                        </div>
                                        <h6 className="feature-title">Highly Customizable</h6>
                                        <p className="feature-desc">
                                            Flexible configuration options to adapt to your unique business requirements.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Help Section */}
                        <div className="help-section mt-5 text-center">
                            <div className="help-card">
                                <iconify-icon icon="solar:help-broken" class="fs-3 text-muted mb-2"></iconify-icon>
                                <h6 className="help-title">Need Help Getting Started?</h6>
                                <p className="help-desc mb-3">
                                    Our support team is here to help you make the most of your modules.
                                </p>
                                <div className="help-actions">
                                    <button className="btn btn-outline-primary btn-sm me-2">
                                        <iconify-icon icon="solar:book-broken" class="me-1"></iconify-icon>
                                        Documentation
                                    </button>
                                    <button className="btn btn-outline-secondary btn-sm">
                                        <iconify-icon icon="solar:chat-round-broken" class="me-1"></iconify-icon>
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleNotSelected;
