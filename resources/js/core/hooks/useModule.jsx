import { useState, useEffect, useCallback } from 'react';
import { useModule } from './moduleContext';

/**
 * Custom hook for module selection with additional features
 */
export const useModuleSelector = () => {
    const {
        selectedModule,
        modules,
        loading,
        error,
        setSelectedModule,
        clearSelectedModule,
        fetchModules,
        searchModules,
        isModuleSelected
    } = useModule();

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredModules, setFilteredModules] = useState([]);

    // Update filtered modules when search query or modules change
    useEffect(() => {
        if (searchQuery) {
            setFilteredModules(searchModules(searchQuery));
        } else {
            setFilteredModules(modules);
        }
    }, [searchQuery, modules, searchModules]);

    // Fetch modules when selector opens
    useEffect(() => {
        if (isOpen && modules.length === 0 && !loading) {
            fetchModules();
        }
    }, [isOpen, modules.length, loading, fetchModules]);

    const openSelector = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeSelector = useCallback(() => {
        setIsOpen(false);
        setSearchQuery('');
    }, []);

    const toggleSelector = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const handleModuleSelect = useCallback((moduleData) => {
        setSelectedModule(moduleData);
        closeSelector();
    }, [setSelectedModule, closeSelector]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const refreshModules = useCallback(() => {
        return fetchModules(true);
    }, [fetchModules]);

    return {
        // State
        selectedModule,
        modules: filteredModules,
        allModules: modules,
        loading,
        error,
        isOpen,
        searchQuery,

        // Actions
        openSelector,
        closeSelector,
        toggleSelector,
        handleModuleSelect,
        handleSearch,
        clearSelectedModule,
        refreshModules,
        isModuleSelected
    };
};

/**
 * Custom hook for module details with caching
 */
export const useModuleDetails = (moduleId) => {
    const { getModuleById } = useModule();
    const [moduleDetails, setModuleDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchModuleDetails = useCallback(async () => {
        if (!moduleId) return;

        setLoading(true);
        setError(null);

        try {
            const details = await getModuleById(moduleId);
            setModuleDetails(details);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [moduleId, getModuleById]);

    useEffect(() => {
        fetchModuleDetails();
    }, [fetchModuleDetails]);

    return {
        moduleDetails,
        loading,
        error,
        refetch: fetchModuleDetails
    };
};

/**
 * Custom hook for module navigation
 */
export const useModuleNavigation = () => {
    const {
        selectedModule,
        modules,
        setSelectedModule,
        isModuleSelected
    } = useModule();

    const navigateToModule = useCallback((moduleData) => {
        setSelectedModule(moduleData);
        // You can add navigation logic here if needed
        // For example: navigate(`/modules/${moduleData.id}`);
    }, [setSelectedModule]);

    const getNextModule = useCallback(() => {
        if (!selectedModule || modules.length === 0) return null;

        const currentIndex = modules.findIndex(m => m.id === selectedModule.id);
        const nextIndex = (currentIndex + 1) % modules.length;
        return modules[nextIndex];
    }, [selectedModule, modules]);

    const getPreviousModule = useCallback(() => {
        if (!selectedModule || modules.length === 0) return null;

        const currentIndex = modules.findIndex(m => m.id === selectedModule.id);
        const previousIndex = currentIndex === 0 ? modules.length - 1 : currentIndex - 1;
        return modules[previousIndex];
    }, [selectedModule, modules]);

    const navigateToNext = useCallback(() => {
        const nextModule = getNextModule();
        if (nextModule) {
            navigateToModule(nextModule);
        }
    }, [getNextModule, navigateToModule]);

    const navigateToPrevious = useCallback(() => {
        const previousModule = getPreviousModule();
        if (previousModule) {
            navigateToModule(previousModule);
        }
    }, [getPreviousModule, navigateToModule]);

    return {
        selectedModule,
        navigateToModule,
        getNextModule,
        getPreviousModule,
        navigateToNext,
        navigateToPrevious,
        isModuleSelected,
        hasNext: !!getNextModule(),
        hasPrevious: !!getPreviousModule()
    };
};

/**
 * Custom hook for module statistics and analytics
 */
export const useModuleStats = () => {
    const { modules, getModuleStats, getModulesByStatus } = useModule();

    const stats = getModuleStats();
    const activeModules = getModulesByStatus(1);
    const inactiveModules = getModulesByStatus(0);

    const getModulesByCategory = useCallback((category) => {
        return modules.filter(module => 
            module.category?.toLowerCase() === category?.toLowerCase()
        );
    }, [modules]);

    const getMostUsedModules = useCallback((limit = 5) => {
        // This would require usage tracking in the backend
        // For now, return modules sorted by name
        return modules
            .filter(m => m.status === 1)
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, limit);
    }, [modules]);

    return {
        stats,
        activeModules,
        inactiveModules,
        getModulesByCategory,
        getMostUsedModules,
        totalModules: modules.length
    };
};
