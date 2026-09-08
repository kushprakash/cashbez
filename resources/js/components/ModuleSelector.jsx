import React, { useState, useEffect, useRef } from 'react';
import { useModule } from '../core/hooks/moduleContext';
import './ModuleSelector.css';

const ModuleSelector = ({ isOpen, onClose, onModuleSelect }) => {
    const { 
        modules, 
        loading, 
        error, 
        fetchModules, 
        searchModules 
    } = useModule();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredModules, setFilteredModules] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen && modules.length === 0) {
            fetchModules();
        }
    }, [isOpen, modules.length, fetchModules]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredModules(searchModules(searchQuery));
        } else {
            setFilteredModules(modules);
        }
    }, [searchQuery, modules, searchModules]);

    const handleModuleClick = (mainModule) => {
        if (onModuleSelect) {
            onModuleSelect({
                mainModule
            });
        }
        onClose();
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="module-dropdown" ref={dropdownRef}>
            {loading ? (
                <div className="dropdown-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading...</span>
                </div>
            ) : error ? (
                <div className="dropdown-error">
                    <iconify-icon icon="solar:danger-triangle-broken"></iconify-icon>
                    <span>Error loading modules</span>
                    <button onClick={() => fetchModules(true)} className="retry-btn">
                        <iconify-icon icon="solar:refresh-broken"></iconify-icon>
                    </button>
                </div>
            ) : (
                <>
                    {/* Search Input */}
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="module-search-input"
                        />
                        <iconify-icon icon="solar:magnifer-broken" className="search-icon"></iconify-icon>
                    </div>

                    {/* Modules Grid */}
                    <div className="modules-grid">
                        {filteredModules.length > 0 ? filteredModules.map((mainModule) => (
                            <div 
                                key={mainModule.id} 
                                className="module-item"
                                onClick={() => handleModuleClick(mainModule)}
                            >
                                <div className="module-icon">
                                    <iconify-icon icon={mainModule.icon}></iconify-icon>
                                </div>
                                <span className="module-name">{mainModule.name}</span>
                            </div>
                        )) : (
                            <div className="no-modules">
                                <iconify-icon icon="solar:box-broken"></iconify-icon>
                                <span>No modules found</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ModuleSelector;
