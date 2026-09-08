import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../core/hooks/context';
import { useModuleSelector } from '../core/hooks/useModule';
import userPhoto from '../../../public/assets/images/users/avatar-1.jpg';
import ModuleSelector from '../components/ModuleSelector';
import { storeTokenAndUserData } from '../core/auth/tokenManager';

const Topbar = ({ handleSidebarToggle, toggleTheme }) => {
    const { userData: user, logout, setProfile } = useContext(AuthContext);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [impersonatedAdmin, setImpersonatedAdmin] = useState(null);
    const profileRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const checkImpersonation = () => {
            try {
                const stored = localStorage.getItem('impersonatorAdmin');
                if (stored) {
                    setImpersonatedAdmin(JSON.parse(stored));
                } else {
                    setImpersonatedAdmin(null);
                }
            } catch (e) {
                setImpersonatedAdmin(null);
            }
        };
        checkImpersonation();
        window.addEventListener('storage', checkImpersonation);
        window.addEventListener('impersonationChanged', checkImpersonation);
        return () => {
            window.removeEventListener('storage', checkImpersonation);
            window.removeEventListener('impersonationChanged', checkImpersonation);
        };
    }, []);

    const handleReturnToSuperAdmin = async () => {
        try {
            const stored = localStorage.getItem('impersonatorAdmin');
            let adminId = 1;
            let adminToken = '';
            if (stored) {
                const adminSession = JSON.parse(stored);
                adminId = adminSession.id || 1;
                adminToken = adminSession.token || '';
            }

            const currentToken = localStorage.getItem('token') || '';
            const res = await axios.post(
                '/api/admin/manage-user-report/revert-impersonate',
                { admin_id: adminId, admin_token: adminToken },
                { headers: { Token: currentToken, token: currentToken } }
            );

            if (res && res.data && res.data.status === 1 && res.data.token && res.data.user) {
                localStorage.setItem('token', res.data.token);
                storeTokenAndUserData(res.data.token, res.data.user);

                if (setProfile) {
                    setProfile(res.data.user);
                }

                localStorage.removeItem('impersonatorAdmin');
                window.dispatchEvent(new Event('impersonationChanged'));
                window.location.href = '/banking/manage-user-report';
            } else {
                localStorage.removeItem('impersonatorAdmin');
                window.dispatchEvent(new Event('impersonationChanged'));
                window.location.href = '/banking/manage-user-report';
            }
        } catch (e) {
            console.error('Error returning to Super Admin:', e);
            localStorage.removeItem('impersonatorAdmin');
            window.location.href = '/banking/manage-user-report';
        }
    };

    const {
        selectedModule,
        isOpen: isModuleSelectorOpen,
        openSelector,
        closeSelector,
        toggleSelector,
        handleModuleSelect,
        clearSelectedModule
    } = useModuleSelector();

    const getUserRole = (u) => {
        if (u?.role_name && u.role_name !== 'Unknown') return u.role_name;
        const rId = Number(u?.role);
        if (rId === 1) return 'Admin';
        if (rId === 2) return 'Master Distributor';
        if (rId === 3) return 'Distributor';
        if (rId === 4 || rId === 5) return 'Retailer';
        if (typeof u?.role === 'string' && u.role !== 'Unknown' && isNaN(Number(u.role))) return u.role;
        return 'Retailer';
    };


    return (
        <header className="topbar">
            <div className="container-fluid">
                <div className="navbar-header">
                    <div className="d-flex align-items-center gap-2">
                        {/* Menu Toggle Button */}
                        <div className="topbar-item">
                            <button type="button" className="button-toggle-menu topbar-button" onClick={handleSidebarToggle}>
                                <iconify-icon icon="solar:hamburger-menu-broken" class="fs-24 align-middle"></iconify-icon>
                            </button>
                        </div>

                        {/* Module Selector Tab */}
                        <div className="topbar-item position-relative">
                            <button
                                type="button"
                                className={`topbar-button d-flex align-items-center gap-2 ${isModuleSelectorOpen ? 'active' : ''}`}
                                id="module-tab"
                                onClick={toggleSelector}
                                title={selectedModule ? `Current: ${selectedModule.mainModule?.name || selectedModule.name}` : "Open Module Navigator"}
                            >
                                <iconify-icon icon="solar:widget-5-broken" class="fs-24 align-middle"></iconify-icon>

                                {selectedModule && (
                                    <>
                                        <span className="d-none d-md-inline fs-16 fw-bold">{selectedModule.mainModule?.name || selectedModule.name}</span>
                                    </>
                                )}
                            </button>

                            {/* Module Selector Dropdown */}
                            <ModuleSelector
                                isOpen={isModuleSelectorOpen}
                                onClose={closeSelector}
                                onModuleSelect={handleModuleSelect}
                            />
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                        {impersonatedAdmin && (
                            <div className="topbar-item me-2">
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm font-weight-bold d-flex align-items-center gap-1 shadow-sm px-3"
                                    style={{
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        backgroundColor: '#dc3545',
                                        color: '#fff',
                                        border: 'none',
                                        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.4)'
                                    }}
                                    onClick={handleReturnToSuperAdmin}
                                    title="Click to return to Super Admin session"
                                >
                                    <i className="fas fa-undo"></i> Return to Super Admin
                                </button>
                            </div>
                        )}
                        <div className="topbar-item">
                            <button type="button" className="topbar-button" id="light-dark-mode" onClick={toggleTheme}>
                                <iconify-icon icon="solar:moon-broken" class="fs-24 align-middle light-mode"></iconify-icon>
                                <iconify-icon icon="solar:sun-broken" class="fs-24 align-middle dark-mode"></iconify-icon>
                            </button>
                        </div>
                        {/* Notification */}
                        <div className="dropdown topbar-item">
                            <button type="button" className="topbar-button position-relative" id="page-header-notifications-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <iconify-icon icon="solar:bell-bing-broken" class="fs-24 align-middle"></iconify-icon>
                                <span className="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill">
                                    3<span className="visually-hidden">unread messages</span>
                                </span>
                            </button>
                            <div className="dropdown-menu py-0 dropdown-lg dropdown-menu-end" aria-labelledby="page-header-notifications-dropdown">
                                <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="m-0 fs-16 fw-semibold"> Notifications</h6>
                                        </div>
                                        <div className="col-auto">
                                            <a href="#" className="text-dark text-decoration-underline">
                                                <small>Clear All</small>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div data-simplebar style={{ maxHeight: 280 }}>
                                    {/* Example notification items */}
                                    <a href="#" className="dropdown-item py-3 border-bottom text-wrap">
                                        <div className="d-flex">
                                            <div className="flex-shrink-0">
                                                <img src="assets/images/users/avatar-1.jpg" className="img-fluid me-2 avatar-sm rounded-circle" alt="avatar-1" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="mb-0"><span className="fw-medium">Josephine Thompson </span>commented on admin panel <span>" Wow 😍! this admin looks good and awesome design"</span></p>
                                            </div>
                                        </div>
                                    </a>
                                    {/* ...other items... */}
                                </div>
                                <div className="text-center py-3">
                                    <a href="#" className="btn btn-primary btn-sm">View All Notification <i className="bx bx-right-arrow-alt ms-1"></i></a>
                                </div>
                            </div>
                        </div>
                        {/* User Profile Dropdown */}
                        <div className="dropdown topbar-item position-relative" ref={profileRef}>
                            <button
                                type="button"
                                className="topbar-button border-0 bg-transparent cursor-pointer"
                                id="page-header-user-dropdown"
                                onClick={() => setIsProfileOpen(prev => !prev)}
                            >
                                <span className="d-flex align-items-center">
                                    <img className="rounded-circle" width="34" height="34" src={user?.photo || userPhoto} alt="avatar-3" style={{ objectFit: 'cover' }} />
                                </span>
                            </button>
                            <div className={`dropdown-menu dropdown-menu-end ${isProfileOpen ? 'show' : ''}`} style={{ right: 0, left: 'auto', minWidth: '200px' }}>
                                <div className="px-3 py-2.5 text-center border-bottom bg-light rounded-top">
                                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>{user?.name || 'User Name'}</h6>
                                    <div className="text-primary fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                        {getUserRole(user)}
                                    </div>
                                </div>
                                <Link className="dropdown-item py-2" to="/profile" onClick={() => setIsProfileOpen(false)}>
                                    <i className="bx bx-user text-primary fs-18 align-middle me-2"></i><span className="align-middle fw-medium">Profile</span>
                                </Link>
                                <Link className="dropdown-item py-2" to="/chat" onClick={() => setIsProfileOpen(false)}>
                                    <i className="bx bx-help-circle text-info fs-18 align-middle me-2"></i><span className="align-middle fw-medium">Help &amp; Support</span>
                                </Link>

                                {user?.is_api_partner == 1 && (
                                    <a className="dropdown-item py-2" href="/api-docs" target='_blank'>
                                        <i className="bx bx-help-circle text-info fs-18 align-middle me-2"></i><span className="align-middle fw-medium">API Documentation</span>
                                    </a>
                                )}

                                <div className="dropdown-divider my-1"></div>
                                <button type="button" className="dropdown-item text-danger py-2" onClick={() => { setIsProfileOpen(false); logout(); }}>
                                    <i className="bx bx-log-out fs-18 align-middle me-2"></i><span className="align-middle fw-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </header >
    );
};

export default Topbar;
