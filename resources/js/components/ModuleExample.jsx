import React from 'react';
import { useModule, useModuleSelector, useModuleStats } from '../core/hooks/useModule';

/**
 * Example component showing how to use the module system
 */
const ModuleExample = () => {
    // Basic module usage
    const { 
        selectedModule, 
        modules, 
        loading, 
        setSelectedModule, 
        clearSelectedModule 
    } = useModule();

    // Module selector hook for dropdown/modal functionality
    const {
        isOpen: isSelectorOpen,
        toggleSelector,
        handleModuleSelect,
        searchQuery,
        handleSearch
    } = useModuleSelector();

    // Module statistics
    const { stats, activeModules } = useModuleStats();

    const handleQuickSelect = (moduleId) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            setSelectedModule(module);
        }
    };

    return (
        <div className="module-example">
            <div className="card">
                <div className="card-header">
                    <h5>Module Management Example</h5>
                </div>
                <div className="card-body">
                    {/* Current Module Display */}
                    <div className="mb-3">
                        <label className="form-label">Current Module:</label>
                        <div className="d-flex align-items-center gap-2">
                            {selectedModule ? (
                                <>
                                    <iconify-icon icon={selectedModule.icon}></iconify-icon>
                                    <span className="fw-medium">{selectedModule.mainModule?.name || selectedModule.name}</span>
                                    <button 
                                        className="btn btn-sm btn-outline-danger ms-2"
                                        onClick={clearSelectedModule}
                                    >
                                        Clear
                                    </button>
                                </>
                            ) : (
                                <span className="text-muted">No module selected</span>
                            )}
                        </div>
                    </div>

                    {/* Module Selector Button */}
                    <div className="mb-3">
                        <button 
                            className="btn btn-primary"
                            onClick={toggleSelector}
                        >
                            {isSelectorOpen ? 'Close' : 'Open'} Module Selector
                        </button>
                    </div>

                    {/* Search Example */}
                    <div className="mb-3">
                        <label className="form-label">Search Modules:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Quick Select Active Modules */}
                    <div className="mb-3">
                        <label className="form-label">Quick Select (Active Modules):</label>
                        <div className="d-flex flex-wrap gap-2">
                            {activeModules.slice(0, 5).map(module => (
                                <button
                                    key={module.id}
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleQuickSelect(module.id)}
                                >
                                    <iconify-icon icon={module.icon} className="me-1"></iconify-icon>
                                    {module.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Module Statistics */}
                    <div className="mb-3">
                        <label className="form-label">Module Statistics:</label>
                        <div className="row">
                            <div className="col-md-3">
                                <div className="text-center p-2 border rounded">
                                    <div className="h4 mb-0 text-primary">{stats.total}</div>
                                    <small className="text-muted">Total</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-2 border rounded">
                                    <div className="h4 mb-0 text-success">{stats.active}</div>
                                    <small className="text-muted">Active</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-2 border rounded">
                                    <div className="h4 mb-0 text-warning">{stats.inactive}</div>
                                    <small className="text-muted">Inactive</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-2 border rounded">
                                    <div className="h6 mb-0 text-info">
                                        {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Never'}
                                    </div>
                                    <small className="text-muted">Last Updated</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center">
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2">Loading modules...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModuleExample;
