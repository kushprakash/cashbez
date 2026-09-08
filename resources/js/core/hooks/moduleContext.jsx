import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import moduleService from '../services/ModuleService';
import { notify } from '../messages/Toast';

// Create the Module Context
const ModuleContext = createContext();

/**
 * Custom hook to use Module Context
 */
export const useModule = () => {
    const context = useContext(ModuleContext);
    if (!context) {
        throw new Error('useModule must be used within a ModuleProvider');
    }
    return context;
};

/**
 * Module Provider Component
 * Provides module state management throughout the application
 */
export const ModuleProvider = ({ children }) => {
    // State management
    const [selectedModule, setSelectedModuleState] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    /**
     * Initialize module context
     */
    const initialize = useCallback(async () => {
        if (isInitialized) return;
        
        setLoading(true);
        try {
            // Load selected module from cookie
            const savedModule = moduleService.getSelectedModule();
            
            // Load cached modules if available
            const cachedModules = moduleService.getCachedModules();
            if (cachedModules && cachedModules.length > 0) {
                setModules(cachedModules);
            }

            // If saved module exists, use it
            if (savedModule) {
                setSelectedModuleState(savedModule);
                setIsInitialized(true);
                setLoading(false);
                return;
            }

            // If no saved module, fetch modules and auto-select first one
            const result = await moduleService.fetchModules(false);
            if (result.success && result.data && result.data.length > 0) {
                setModules(result.data);
                // Auto-select first main module
                const firstModule = result.data[0];
                const moduleData = {
                    mainModule: firstModule
                };
                const updatedModule = moduleService.setSelectedModule(moduleData);
                setSelectedModuleState(updatedModule);
                console.log('Auto-selected first module:', firstModule.name);
            }

            setIsInitialized(true);
        } catch (error) {
            console.error('ModuleProvider - initialization error:', error);
            setError('Failed to initialize module system');
            setIsInitialized(true); // Initialize even on error to prevent infinite loading
        } finally {
            setLoading(false);
        }
    }, [isInitialized]);

    /**
     * Fetch all modules from API
     */
    const fetchModules = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await moduleService.fetchModules(forceRefresh);
            
            if (result.success) {
                setModules(result.data);
                return result.data;
            } else {
                setError(result.error);
                notify.error(result.error);
                return null;
            }
        } catch (error) {
            const errorMessage = 'Failed to fetch modules';
            setError(errorMessage);
            notify.error(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Set selected module
     */
    const setSelectedModule = useCallback((moduleData) => {
        try {
            const updatedModule = moduleService.setSelectedModule(moduleData);
            setSelectedModuleState(updatedModule);
            
            if (moduleData) {
                notify.success(`Switched to ${moduleData.mainModule?.name || moduleData.name} module`);
            }
            
            return updatedModule;
        } catch (error) {
            console.error('ModuleProvider - setSelectedModule error:', error);
            notify.error('Failed to select module');
            return null;
        }
    }, []);

    /**
     * Clear selected module
     */
    const clearSelectedModule = useCallback(() => {
        try {
            moduleService.clearSelectedModule();
            setSelectedModuleState(null);
            notify.info('Module selection cleared');
        } catch (error) {
            console.error('ModuleProvider - clearSelectedModule error:', error);
            notify.error('Failed to clear module selection');
        }
    }, []);

    /**
     * Get module by ID
     */
    const getModuleById = useCallback(async (moduleId) => {
        setLoading(true);
        try {
            const result = await moduleService.fetchModuleById(moduleId);
            
            if (result.success) {
                return result.data;
            } else {
                notify.error(result.error);
                return null;
            }
        } catch (error) {
            notify.error('Failed to fetch module details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Search modules
     */
    const searchModules = useCallback((query) => {
        return moduleService.searchModules(query, modules);
    }, [modules]);

    /**
     * Get module statistics
     */
    const getModuleStats = useCallback(() => {
        return moduleService.getModuleStats(modules);
    }, [modules]);

    /**
     * Refresh selected module data
     */
    const refreshSelectedModule = useCallback(async () => {
        if (!selectedModule?.id) return;
        
        try {
            const result = await moduleService.fetchModuleById(selectedModule.id);
            if (result.success) {
                setSelectedModule(result.data);
            }
        } catch (error) {
            console.error('ModuleProvider - refreshSelectedModule error:', error);
        }
    }, [selectedModule, setSelectedModule]);

    /**
     * Check if module is selected
     */
    const isModuleSelected = useCallback((moduleId) => {
        return selectedModule?.id === moduleId || selectedModule?.mainModule?.id === moduleId;
    }, [selectedModule]);

    /**
     * Get modules by status
     */
    const getModulesByStatus = useCallback((status) => {
        return modules.filter(module => module.status === status);
    }, [modules]);

    // Subscribe to module service events
    useEffect(() => {
        const unsubscribe = moduleService.subscribe((event) => {
            switch (event.type) {
                case 'MODULE_SELECTED':
                    setSelectedModuleState(event.payload);
                    break;
                case 'MODULE_CLEARED':
                    setSelectedModuleState(null);
                    break;
                default:
                    break;
            }
        });

        return unsubscribe;
    }, []);

    // Initialize on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Context value
    const contextValue = {
        // State
        selectedModule,
        modules,
        loading,
        error,
        isInitialized,
        
        // Actions
        setSelectedModule,
        clearSelectedModule,
        fetchModules,
        getModuleById,
        searchModules,
        getModuleStats,
        refreshSelectedModule,
        isModuleSelected,
        getModulesByStatus,
        
        // Utilities
        moduleService // Expose service for advanced usage
    };

    return (
        <ModuleContext.Provider value={contextValue}>
            {children}
        </ModuleContext.Provider>
    );
};

export { ModuleContext };
