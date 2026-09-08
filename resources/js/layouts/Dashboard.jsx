import React, { useState, useEffect, Suspense } from 'react';
import { useModule } from '../core/hooks/moduleContext';
import ShimmerLoader from '../components/ShimmerLoader';
import ModuleNotSelected from '../components/ModuleNotSelected';
import ErrorBoundary from '../components/ErrorBoundary';
import ApiService from '../core/services/ApiService';
import DynamicPopup from '../components/DynamicPopup';

// Lazy load dashboard components
const CRMDashboard = React.lazy(() => import('../crm/CRMDashboard'));
const HRMDashboard = React.lazy(() => import('../hrms/HRMDashboard'));
const MasterDashboard = React.lazy(() => import('../pages/MasterDashboard'));
const BankingDashboard = React.lazy(() => import('../banking/BankingDashboard'));
// const MicroFinanceDashboard = React.lazy(() => import('../microfinance/MicroFinanceDashboard'));

// Commented out unused dashboards
// const AccountingDashboard = React.lazy(() => import('../accounting/AccountingDashboard'));
// const LoanDashboard = React.lazy(() => import('../loan/LoanDashboard'));
// const UtilityDashboard = React.lazy(() => import('../utility/UtilityDashboard'));
// const SMSDashboard = React.lazy(() => import('../sms/SMSDashboard'));

// Dashboard component mapping
const dashboardComponents = {
    'crm': CRMDashboard,
    'hrms': HRMDashboard,
    'master': MasterDashboard,
    'super admin': MasterDashboard,
    'superadmin': MasterDashboard,
    'admin': MasterDashboard,
    'banking': BankingDashboard,
    // 'microfinance': MicroFinanceDashboard, // not available

    // Commented out unused dashboard mappings
    // 'hr': HRMDashboard,
    // 'human resource': HRMDashboard,
    // 'super admin': MasterDashboard,
    // 'account': AccountingDashboard,
    // 'accounting': AccountingDashboard,
    // 'loan': LoanDashboard,
    // 'utility': UtilityDashboard,
    // 'utilities': UtilityDashboard,
    // 'sms': SMSDashboard,
    // 'messaging': SMSDashboard,
};

// Default dashboard for unknown modules
const DefaultDashboard = React.lazy(() =>
    Promise.resolve({
        default: () => (
            <div className="dashboard-container">
                <div className="welcome-section">
                    <div className="container-fluid">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="welcome-card">
                                    <div className="welcome-content text-center">
                                        <div className="welcome-icon mb-4">
                                            <iconify-icon icon="solar:widget-5-broken" class="fs-1 text-primary"></iconify-icon>
                                        </div>
                                        <h2 className="welcome-title mb-3">Welcome to Your Dashboard</h2>
                                        <p className="welcome-subtitle text-muted mb-4">
                                            This module doesn't have a specific dashboard yet. We're working on adding more features.
                                        </p>
                                        <div className="welcome-actions">
                                            <button className="btn btn-primary btn-lg me-3">
                                                <iconify-icon icon="solar:settings-broken" class="me-2"></iconify-icon>
                                                Configure Module
                                            </button>
                                            <button className="btn btn-outline-secondary btn-lg">
                                                <iconify-icon icon="solar:help-broken" class="me-2"></iconify-icon>
                                                Get Help
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    })
);

const Dashboard = () => {
    const { selectedModule, loading: moduleLoading, isInitialized } = useModule();
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardError, setDashboardError] = useState(null);

    // Fetch module-specific dashboard data
    useEffect(() => {
        if (isInitialized && selectedModule?.mainModule?.id) {
            setDashboardLoading(true);
            const fetchDashboardData = async () => {
                try {
                    console.log('Dashboard initialized for module:', selectedModule);

                    // Dynamic main module wise data loading
                    const apiService = ApiService();
                    const response = await apiService.vGet('/api/dashboard', {
                        params: { mainModule: selectedModule.mainModule.id }
                    });

                    if (response?.data?.status === 1) {
                        setDashboardData(response.data.data);
                        setDashboardError(null);
                    } else {
                        throw new Error(response?.data?.message || 'Failed to fetch dashboard data');
                    }
                } catch (error) {
                    console.error('Error fetching dashboard data:', error);
                    setDashboardError(error.message || 'Failed to load dashboard data');
                } finally {
                    setDashboardLoading(false);
                }
            };

            const timer = setTimeout(() => {
                fetchDashboardData();
            }, 300); // Reduced delay for faster load

            return () => clearTimeout(timer);
        } else if (isInitialized) {
            // Module context initialized but no module selected yet
            setDashboardLoading(false);
        }
    }, [isInitialized, selectedModule]);

    // Show shimmer loader while modules are loading or dashboard is initializing
    if (moduleLoading || dashboardLoading || !isInitialized) {
        return <ShimmerLoader />;
    }

    // Show module selection prompt if no module is selected
    if (!selectedModule) {
        return <ModuleNotSelected />;
    }

    // Get the appropriate dashboard component
    const getModuleDashboard = () => {
        const moduleName = selectedModule?.mainModule?.name || selectedModule?.name;
        if (!moduleName) return DefaultDashboard;

        const normalizedName = moduleName.toLowerCase().trim();

        // Try exact match first
        if (dashboardComponents[normalizedName]) {
            return dashboardComponents[normalizedName];
        }

        // Try partial matches
        for (const [key, component] of Object.entries(dashboardComponents)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                return component;
            }
        }

        return DefaultDashboard;
    };

    const DashboardComponent = getModuleDashboard();

    return (
        <div className="dashboard-wrapper">
            {/* Dynamic Popup - Shows on home/dashboard */}
            <DynamicPopup screen="home" />

            <ErrorBoundary
                fallback={
                    <div className="error-container">
                        <div className="container-fluid">
                            <div className="row justify-content-center">
                                <div className="col-lg-6">
                                    <div className="error-card text-center">
                                        <iconify-icon icon="solar:danger-triangle-broken" class="fs-1 text-danger mb-3"></iconify-icon>
                                        <h3>Dashboard Error</h3>
                                        <p className="text-muted mb-4">
                                            Something went wrong while loading the dashboard. Please try refreshing the page.
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => window.location.reload()}
                                        >
                                            <iconify-icon icon="solar:refresh-broken" class="me-2"></iconify-icon>
                                            Refresh Page
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            >
                <Suspense fallback={<ShimmerLoader />}>
                    <DashboardComponent
                        dashboardData={dashboardData}
                        dashboardError={dashboardError}
                        selectedModule={selectedModule}
                    />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
};

export default Dashboard;