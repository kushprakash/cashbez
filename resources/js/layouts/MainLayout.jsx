import React, { useEffect, useState, useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from '../core/hooks/context';
import { ModuleProvider } from '../core/hooks/moduleContext';
import AuthData from '../core/auth/AuthData';
import Topbar from './Topbar';
import Header from './Header';
import KycGuard from '../components/KycGuard';
import { notify } from "../core/messages/Toast";
import KycStatusIndicator from '../components/KycStatusIndicator';
import { retrieveTokenAndUserData, clearTokenAndUserData } from '../core/auth/tokenManager';
import 'boxicons/css/boxicons.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayoutContent = () => {
    const navigate = useNavigate();
    const authCtx = useContext(AuthContext);

    const [theme, setTheme] = useState(() => {
        // Check localStorage for theme preference
        return localStorage.getItem('theme') || 'light';
    });

    const initialData = retrieveTokenAndUserData();
    const token = authCtx?.token || initialData?.token;
    const user = authCtx?.userData || initialData?.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        // Toggle sidebar-enable class on html
        if (sidebarOpen) {
            document.documentElement.classList.add('sidebar-enable');
            document.body.style.overflow = 'hidden';
        } else {
            document.documentElement.classList.remove('sidebar-enable');
            document.body.style.overflow = '';
        }
    }, [sidebarOpen]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const handleSidebarToggle = () => {
        setSidebarOpen(open => !open);
    };

    const logout = () => {
        if (authCtx?.logout) {
            authCtx.logout();
        } else {
            clearTokenAndUserData();
            notify.success("SUCCESS !! Logged out successfully.");
            navigate("/signin");
        }
    };

    return (
        <>
            <AuthData />

            {user && user?.aeps_status !== undefined && user?.aeps_status < 3 ? (
                <div
                    className="d-flex align-items-center justify-content-center min-vh-100"
                    style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f6e9ff 100%)' }}
                >
                    <div
                        className="alert alert-warning d-flex flex-column align-items-center justify-content-center py-4 shadow rounded-4 mx-auto"
                        style={{ maxWidth: 480, background: 'rgba(255,255,255,0.97)' }}
                    >
                        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-3 text-warning">
                            <circle cx="12" cy="12" r="10" fill="#fff" stroke="#ffc107" strokeWidth="2" />
                            <path d="M12 7v5" stroke="#ffc107" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="16" r="1.5" fill="#ffc107" />
                        </svg>

                        <h5 className="fw-bold mb-2 text-dark">Onboarding Incomplete</h5>

                        <p className="mb-1 text-secondary text-center">
                            Your AEPS onboarding is not finished yet.
                        </p>

                        <p className="mb-3 text-muted small text-center">
                            Complete the remaining steps to activate your account and enable transactions.
                        </p>

                        <div className='d-flex align-items-center justify-content-center gap-2'>
                            <a href="https://play.google.com/store/apps/details?id=com.enexa.erpcashbez"
                                className="btn btn-warning px-4 fw-semibold shadow-sm"
                            >
                                Open Mobile APP
                            </a>

                            <button onClick={logout} className="btn btn-danger px-4 fw-semibold shadow-sm">Logout</button>

                        </div>

                    </div>
                </div>
            ) : !token ? (
                <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f6e9ff 100%)' }}>
                    <div className="alert alert-warning d-flex flex-column align-items-center justify-content-center py-4 shadow rounded-4 mx-auto" style={{ maxWidth: 480, background: 'rgba(255,255,255,0.97)' }}>
                        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-3 text-warning">
                            <circle cx="12" cy="12" r="10" fill="#fff" stroke="#ffc107" strokeWidth="2" />
                            <path d="M12 7v5" stroke="#ffc107" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="16" r="1.5" fill="#ffc107" />
                        </svg>
                        <h5 className="fw-bold mb-2 text-dark">Access Restricted</h5>
                        <p className="mb-1 text-secondary">You must be signed in to access premium features and content.</p>
                        <p className="mb-3 text-muted small">Rest assured, your experience is important to us. Signing in is quick and secure, and unlocks all the benefits our platform offers.</p>
                        <Link to="/signin" className="btn btn-warning px-4 fw-semibold shadow-sm">Sign In to Continue</Link>
                    </div>
                </div>
            ) :
                (
                    <div className="wrapper">
                        <Topbar handleSidebarToggle={handleSidebarToggle} toggleTheme={toggleTheme} />
                        <Header onSidebarToggle={handleSidebarToggle} />
                        <div className="main-content">
                            <div className="page-content">
                                <KycGuard>
                                    <Outlet context={{ handleSidebarToggle }} />
                                </KycGuard>
                            </div>
                        </div>
                        <KycStatusIndicator />
                    </div>)
            }

            {sidebarOpen && (
                <div className="offcanvas-backdrop fade show" onClick={handleSidebarToggle}></div>
            )}
        </>
    );
};

const MainLayout = () => {
    return (
        <AuthProvider>
            <ModuleProvider>
                <MainLayoutContent />
            </ModuleProvider>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </AuthProvider>
    );
};

export default MainLayout;

