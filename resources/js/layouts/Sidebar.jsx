import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useModule } from '../core/hooks/moduleContext';
import ApiService from '../core/services/ApiService';

const Sidebar = ({ onSidebarToggle }) => {
    const { selectedModule } = useModule();
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previousModuleId, setPreviousModuleId] = useState(null);

    // Function to check if device is mobile
    const isMobileView = () => {
        return window.innerWidth <= 1140; // Based on the _adjustLayout logic in app.js
    };

    // Function to handle menu item click
    const handleMenuItemClick = () => {
        // Close sidebar on mobile view
        if (isMobileView() && onSidebarToggle) {
            onSidebarToggle();
        }
    };

    useEffect(() => {
        // if (!selectedModule) return; // Ensure selectedModule is available
        
        const currentModuleId = selectedModule?.mainModule?.id || selectedModule?.id;
        const isModuleChanged = previousModuleId !== null && previousModuleId !== currentModuleId;
        
        // Load menu data from API/Database
        const loadMenuData = async () => {
            try {
                setLoading(true);
                const savedModule = selectedModule || [];
                const apiService = ApiService();
                const response = await apiService.vPost(`/api/menu-structure`, { main_module_id: selectedModule?.mainModule?.id || selectedModule?.id });
                if (response.data.status === 1) {
                    
                    const data = response?.data || [];
                    setMenuData(data);
                    setError(null);
                    
                    // Only navigate to dashboard when main module is actually changing, not on page refresh
                    if (isModuleChanged) {
                       // navigate('/dashboard');
                    }
                }
                else {
                    throw new Error(response.data.message || 'Failed to load menu data');
                }
            } catch (err) {
                setError(err.message);
                console.error('Failed to load menu data:', err);

                setError(null);
            } finally {
                setLoading(false);
            }
        };

        loadMenuData();
        setPreviousModuleId(currentModuleId);

    }, [selectedModule]);

    // Dynamic menu state
    const [openDropdowns, setOpenDropdowns] = useState({});

    // Dynamic helper functions
    const isActive = (url) => path === url;

    const isMenuActive = (menuItem) => {
        if (menuItem.url && isActive(menuItem.url)) return true;
        if (menuItem.children) {
            return menuItem.children.some(child => isMenuActive(child));
        }
        return false;
    };

    const shouldBeOpen = (menuItem) => {
        if (menuItem.children) {
            return menuItem.children.some(child => isMenuActive(child));
        }
        return false;
    };

    // Auto-open dropdowns based on current path
    useEffect(() => {
        if (!menuData) return; // Wait for menu data to load

        const newDropdownState = {};

        const processMenuItem = (item) => {
            if (item.type === 'dropdown') {
                newDropdownState[item.id] = shouldBeOpen(item);
                if (item.children) {
                    item.children.forEach(child => processMenuItem(child));
                }
            }
        };

        // Process all sections and their items
        menuData.sections.forEach(section => {
            section.items.forEach(item => processMenuItem(item));
        });

        setOpenDropdowns(newDropdownState);
    }, [path, menuData]);

    // Toggle dropdown manually
    const handleDropdown = (key) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Process menu data to handle module/submodule name duplicates and repeated submodules
    const processMenuData = (menuData) => {
        if (!menuData || !menuData.sections) return menuData;

        const processedSections = menuData.sections.map(section => ({
            ...section,
            items: section.items.map(item => {
                // If item is dropdown with children
                if (item.type === 'dropdown' && item.children) {
                    // Check for single child with same name as parent
                    if (item.children.length === 1) {
                        const singleChild = item.children[0];

                        // If module and submodule have same name, return just the submodule
                        if (item.title === singleChild.title && singleChild.type === 'dropdown') {
                            return {
                                ...singleChild,
                                icon: item.icon || singleChild.icon // Preserve icon from parent if needed
                            };
                        }

                        // If module has single menu item with same name, show only the menu item
                        if (item.title === singleChild.title && singleChild.type === 'link') {
                            return {
                                ...singleChild,
                                icon: item.icon || singleChild.icon // Preserve icon from parent if needed
                            };
                        }
                    }

                    // Check for repeated submodules and consolidate them
                    const consolidatedChildren = {};
                    const processedChildren = [];

                    item.children.forEach(child => {
                        if (child.type === 'dropdown') {
                            // Check if submodule has only one menu item with same name
                            if (child.children && child.children.length === 1) {
                                const singleMenu = child.children[0];
                                // If submodule name and menu name are same, show only the menu item
                                if (child.title === singleMenu.title && singleMenu.type === 'link') {
                                    processedChildren.push({
                                        ...singleMenu,
                                        icon: child.icon || item.icon || singleMenu.icon // Preserve icon hierarchy
                                    });
                                    return; // Skip normal submodule processing
                                }
                            }

                            // If we've seen this submodule title before, merge their children
                            if (consolidatedChildren[child.title]) {
                                // Merge children from repeated submodule
                                consolidatedChildren[child.title].children = [
                                    ...consolidatedChildren[child.title].children,
                                    ...(child.children || [])
                                ];
                            } else {
                                // First time seeing this submodule, add it
                                consolidatedChildren[child.title] = { ...child };
                            }
                        } else {
                            // Direct link item, add as is
                            processedChildren.push(child);
                        }
                    });

                    // Add consolidated submodules to processed children
                    Object.values(consolidatedChildren).forEach(consolidatedChild => {
                        // Remove duplicate permissions within the consolidated submodule
                        if (consolidatedChild.children) {
                            const uniquePermissions = {};
                            consolidatedChild.children.forEach(permission => {
                                if (!uniquePermissions[permission.id]) {
                                    uniquePermissions[permission.id] = permission;
                                }
                            });
                            consolidatedChild.children = Object.values(uniquePermissions);
                        }
                        processedChildren.push(consolidatedChild);
                    });

                    return {
                        ...item,
                        children: processedChildren
                    };
                }
                return item;
            })
        }));

        return {
            ...menuData,
            sections: processedSections
        };
    };

    // Render menu item recursively
    const renderMenuItem = (item, level = 0) => {
        if (item.type === 'link') {
            return (
                <li key={item.id} className={level === 0 ? "nav-item" : "sub-nav-item"}>
                    <Link
                        className={`${level === 0 ? 'nav-link' : 'sub-nav-link'} d-flex align-items-center${isActive(item.url) ? ' active' : ''}`}
                        to={item.url}
                        onClick={handleMenuItemClick}
                    >
                        {level === 0 && (
                            <>
                                <span className="shape1"></span>
                                <span className="shape2"></span>
                                <span className="nav-icon d-flex align-items-center justify-content-center">
                                    {item.icon?.startsWith('fa') ? (
                                        <i className={item.icon} aria-hidden="true"></i>
                                    ) : item.icon?.startsWith('bx') ? (
                                        <i className={item.icon} aria-hidden="true"></i>
                                    ) : (
                                        <iconify-icon icon={item.icon}></iconify-icon>
                                    )}
                                </span>
                            </>
                        )}
                        <span className={level === 0 ? "nav-text" : ""}> {item.title} </span>
                        {item.badge && level === 0 && (
                            <span className="badge bg-success badge-pill text-end ms-auto">{item.badge}</span>
                        )}
                    </Link>
                </li>
            );
        }

        if (item.type === 'dropdown') {
            const isOpen = openDropdowns[item.id] || false;
            const hasActiveChild = isMenuActive(item);

            return (
                <li key={item.id} className={level === 0 ? "nav-item" : "sub-nav-item"}>
                    <button
                        type="button"
                        className={`${level === 0 ? 'nav-link' : 'sub-nav-link'} d-flex align-items-center w-100 text-start bg-transparent border-0${hasActiveChild ? ' active' : ' menu-arrow'}`}
                        onClick={() => handleDropdown(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`sidebar${item.id}`}
                    >
                        {level === 0 && (
                            <>
                                <span className="shape1"></span>
                                <span className="shape2"></span>
                                <span className="nav-icon d-flex align-items-center justify-content-center">
                                    {item.icon?.startsWith('fa') ? (
                                        <i className={item.icon} aria-hidden="true"></i>
                                    ) : item.icon?.startsWith('bx') ? (
                                        <i className={item.icon} aria-hidden="true"></i>
                                    ) : (
                                        <iconify-icon icon={item.icon}></iconify-icon>
                                    )}
                                </span>
                            </>
                        )}
                        <span className={level === 0 ? "nav-text" : ""}> {item.title} </span>
                    </button>
                    <div className={`collapse${isOpen ? ' show' : ''}`} id={`sidebar${item.id}`}>
                        <ul className="nav sub-navbar-nav" style={{ border: 'none', boxShadow: 'none' }}>
                            {item.children?.map(child => renderMenuItem(child, level + 1))}
                        </ul>
                    </div>
                </li>
            );
        }

        return null;
    };

    // Loading and error states
    if (loading) {
        return (
            <aside className="sidebar">
                <div className="scrollbar" data-simplebar style={{ maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
                    <ul className="navbar-nav" id="navbar-nav">
                        <li className="menu-title d-flex align-items-center justify-content-center" style={{ padding: '20px 0' }}>
                            <div className="menu-loader">
                                <div className="loader-spinner me-3">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                                <span className="loader-text text-muted">Loading Menu...</span>
                            </div>
                        </li>
                        {/* Skeleton loader items */}
                        {[1, 2, 3, 4, 5].map((item) => (
                            <li key={item} className="nav-item skeleton-item">
                                <div className="nav-link d-flex align-items-center skeleton-loader">
                                    <span className="nav-icon skeleton-icon"></span>
                                    <span className="nav-text skeleton-text"></span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <style jsx>{`
                    .menu-loader {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: row;
                    }
                    
                    .skeleton-item {
                        margin-bottom: 8px;
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    
                    .skeleton-loader {
                        background: transparent;
                        padding: 12px 20px;
                        border-radius: 6px;
                    }
                    
                    .skeleton-icon {
                        width: 20px;
                        height: 20px;
                        background: rgba(108, 117, 125, 0.1);
                        border: 1px solid rgba(108, 117, 125, 0.15);
                        border-radius: 4px;
                        margin-right: 12px;
                        flex-shrink: 0;
                    }
                    
                    .skeleton-text {
                        height: 16px;
                        background: rgba(108, 117, 125, 0.1);
                        border: 1px solid rgba(108, 117, 125, 0.15);
                        border-radius: 4px;
                        flex: 1;
                        max-width: 120px;
                    }
                    
                    @keyframes pulse {
                        0% { 
                            opacity: 1;
                            background: rgba(108, 117, 125, 0.1);
                        }
                        50% { 
                            opacity: 0.7;
                            background: rgba(108, 117, 125, 0.2);
                        }
                        100% { 
                            opacity: 1;
                            background: rgba(108, 117, 125, 0.1);
                        }
                    }
                    
                    .loader-text {
                        font-size: 14px;
                        font-weight: 500;
                    }
                    
                    .spinner-border-sm {
                        width: 1rem;
                        height: 1rem;
                    }
                `}</style>
            </aside>
        );
    }

    if (error) {
        return (
            <aside className="sidebar">
                <div className="scrollbar" data-simplebar style={{ maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
                    <ul className="navbar-nav" id="navbar-nav">
                        <li className="menu-title d-flex flex-column align-items-center justify-content-center" style={{ padding: '30px 20px' }}>
                            <div className="error-state text-center">
                                <div className="error-icon mb-3">
                                    <iconify-icon
                                        icon="material-symbols:error-outline"
                                        style={{ fontSize: '48px', color: '#dc3545' }}
                                    ></iconify-icon>
                                </div>
                                <h6 className="error-title text-danger mb-2">Unable to Load Menu</h6>
                                <p className="error-message text-muted small mb-3" style={{ fontSize: '12px' }}>
                                    {error}
                                </p>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => window.location.reload()}
                                    style={{ fontSize: '12px', padding: '4px 12px' }}
                                >
                                    <iconify-icon icon="material-symbols:refresh" className="me-1"></iconify-icon>
                                    Retry
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </aside>
        );
    }

    if (!menuData) {
        return (
            <aside className="sidebar">
                <div className="scrollbar" data-simplebar style={{ maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
                    <ul className="navbar-nav" id="navbar-nav">
                        <li className="menu-title d-flex flex-column align-items-center justify-content-center" style={{ padding: '30px 20px' }}>
                            <div className="empty-state text-center">
                                <div className="empty-icon mb-3">
                                    <iconify-icon
                                        icon="material-symbols:menu-book-outline"
                                        style={{ fontSize: '48px', color: '#6c757d' }}
                                    ></iconify-icon>
                                </div>
                                <h6 className="empty-title text-muted mb-2">No Menu Available</h6>
                                <p className="empty-message text-muted small" style={{ fontSize: '12px' }}>
                                    Please select a module to view the menu.
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </aside>
        );
    }

    return (
        <aside className="sidebar">
            <style>{`
                .sidebar .scrollbar::-webkit-scrollbar {
                    display: none;
                    width: 0 !important;
                    height: 0 !important;
                }
                .sidebar .scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="scrollbar" data-simplebar style={{ maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
                <ul className="navbar-nav" id="navbar-nav">
                    {processMenuData(menuData).sections.map((section, index) => (
                        <React.Fragment key={index}>
                            <li className="menu-title">{section.title}</li>
                            {section.items.map(item => renderMenuItem(item))}
                        </React.Fragment>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
