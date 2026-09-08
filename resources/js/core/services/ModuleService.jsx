import ApiService from './ApiService';
import { retrieveTokenAndUserData } from '../auth/tokenManager';

/**
 * ModuleService - Service for managing module-related operations
 * Provides centralized module fetching, caching, and cookie management
 */
class ModuleService {
    constructor() {
        // Initialize without ApiService first
        this.apiService = null;
        this.cache = {
            modules: null,
            lastFetch: null,
            cacheTimeout: 5 * 60 * 1000 // 5 minutes
        };
        this.subscribers = new Set();
        this.tokenWaitTimeout = 10000; // 10 seconds timeout for token wait
        this.tokenCheckInterval = 100; // Check every 100ms
        this.retryAttempts = new Map(); // Track retry attempts per endpoint
        this.maxRetries = 3; // Maximum retry attempts
        this.retryDelay = 1000; // Initial retry delay in ms
        
        // Initialize ApiService after other properties are set
        this.initializeApiService();
    }

    /**
     * Initialize ApiService
     */
    initializeApiService() {
        try {
            this.apiService = ApiService();
            console.log('ModuleService - ApiService initialized');
        } catch (error) {
            console.warn('ModuleService - Failed to initialize ApiService:', error);
            this.apiService = null;
        }
    }

    /**
     * Handle API call with retry logic and token management
     */
    async makeApiCall(endpoint, apiCall, retryKey = null) {
        const key = retryKey || endpoint;
        const currentAttempts = this.retryAttempts.get(key) || 0;

        try {
            // Wait for token to be available before making API call
            if (!this.isTokenAvailable()) {
                if (currentAttempts >= this.maxRetries) {
                    throw new Error('Maximum retry attempts reached while waiting for token');
                }
                
                console.log(`ModuleService - Waiting for token (attempt ${currentAttempts + 1})...`);
                await this.waitForToken();
                console.log('ModuleService - Token available, proceeding with API call');
            }

            // Always refresh ApiService to ensure we have the latest token
            console.log('ModuleService - Refreshing ApiService with latest token');
            const tokenData = this.refreshApiService();
            
            if (!tokenData?.token || !tokenData?.user) {
                throw new Error('Token or user data not available after refresh');
            }

            console.log('ModuleService - Making API call to:', endpoint);
            console.log('ModuleService - Token status:', tokenData.token ? 'Available' : 'Missing');
            console.log('ModuleService - User status:', tokenData.user ? 'Available' : 'Missing');
            console.log('ModuleService - User authorization:', tokenData.user?.authorization ? 'Available' : 'Missing');

            // Reset retry count on successful token acquisition
            this.retryAttempts.delete(key);
            
            // Make the API call
            const result = await apiCall();
            console.log('ModuleService - API call successful for:', endpoint);
            return result;

        } catch (error) {
            console.error(`ModuleService - API call error for ${endpoint}:`, error);
            console.error('ModuleService - Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            
            // Handle authentication errors - don't retry
            if (error.response?.status === 401) {
                console.error('ModuleService - Authentication error (401), clearing retry attempts');
                this.retryAttempts.delete(key);
                throw new Error('Authentication required. Please login again.');
            }

            // Handle bad request errors - limit retries
            if (error.response?.status === 400) {
                const attempts = currentAttempts + 1;
                this.retryAttempts.set(key, attempts);
                
                console.warn(`ModuleService - Bad request (400), attempt ${attempts}/${this.maxRetries}`);
                
                if (attempts >= this.maxRetries) {
                    console.error('ModuleService - Maximum retry attempts reached, giving up');
                    this.retryAttempts.delete(key);
                    throw new Error('Request failed after maximum retry attempts. Please check your authentication.');
                }
                
                // Wait before retry with exponential backoff
                const delay = this.retryDelay * Math.pow(2, currentAttempts);
                console.log(`ModuleService - Retrying in ${delay}ms (attempt ${attempts}/${this.maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Retry the call
                return this.makeApiCall(endpoint, apiCall, key);
            }

            // For other errors, throw immediately
            throw error;
        }
    }

    /**
     * Force refresh of ApiService to pick up latest token
     */
    refreshApiService() {
        console.log('ModuleService - Refreshing ApiService...');
        const tokenData = retrieveTokenAndUserData();
        console.log('ModuleService - Token data retrieved:', {
            hasToken: !!tokenData?.token,
            hasUser: !!tokenData?.user,
            tokenLength: tokenData?.token ? tokenData.token.length : 0,
            userHasAuth: !!tokenData?.user?.authorization
        });
        
        this.apiService = ApiService();
        return tokenData;
    }

    /**
     * Wait for token to be available before making API calls
     */
    async waitForToken() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkToken = () => {
                const { token, user } = retrieveTokenAndUserData() || {};
                
                if (token && user && token.length > 10) { // Basic token validation
                    console.log('ModuleService - Valid token found:', {
                        tokenLength: token.length,
                        hasUser: !!user,
                        hasAuthorization: !!user.authorization
                    });
                    
                    // Token is available, reinitialize ApiService to use the new token
                    this.refreshApiService();
                    resolve(true);
                    return;
                }
                
                // Check if timeout exceeded
                if (Date.now() - startTime > this.tokenWaitTimeout) {
                    console.error('ModuleService - Token wait timeout exceeded');
                    reject(new Error('Token wait timeout exceeded'));
                    return;
                }
                
                // Continue checking
                setTimeout(checkToken, this.tokenCheckInterval);
            };
            
            checkToken();
        });
    }

    /**
     * Check if token is available
     */
    isTokenAvailable() {
        const { token, user } = retrieveTokenAndUserData() || {};
        const isAvailable = !!(token && user && token.length > 10);
        console.log('ModuleService - Token availability check:', {
            token: token ? `Present (${token.length} chars)` : 'Missing',
            user: user ? 'Present' : 'Missing',
            hasAuthorization: !!(user?.authorization),
            isAvailable
        });
        return isAvailable;
    }

    /**
     * Cookie helper functions
     */
    setCookie(name, value, days = 30) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                try {
                    return JSON.parse(c.substring(nameEQ.length, c.length));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }

    /**
     * Module icon mapping
     */
    getModuleIcon(moduleName) {
        const name = moduleName.toLowerCase();
        if (name.includes('banking')) return 'solar:card-broken';
        if (name.includes('account')) return 'solar:user-broken';
        if (name.includes('hr')) return 'solar:users-group-two-rounded-broken';
        if (name.includes('loan')) return 'solar:hand-money-broken';
        if (name.includes('utility')) return 'solar:settings-broken';
        if (name.includes('crm')) return 'solar:widget-5-broken';
        if (name.includes('super')) return 'solar:crown-broken';
        if (name.includes('sms')) return 'solar:chat-round-broken';
        if (name.includes('recharge')) return 'solar:battery-charge-broken';
        if (name.includes('travel')) return 'solar:plane-broken';
        if (name.includes('education')) return 'solar:book-broken';
        if (name.includes('insurance')) return 'solar:shield-check-broken';
        return 'solar:widget-broken';
    }

    /**
     * Fetch all main modules from API
     */
    async fetchModules(forceRefresh = false) {
        const now = Date.now();
        
        // Return cached data if available and not expired
        if (!forceRefresh && this.cache.modules && this.cache.lastFetch && 
            (now - this.cache.lastFetch) < this.cache.cacheTimeout) {
            // Auto-select first module if none is selected
            this.autoSelectFirstModule(this.cache.modules);
            return { success: true, data: this.cache.modules };
        }

        try {
            const response = await this.makeApiCall('/api/main-modules', async () => {
                return await this.apiService.vGet('/api/main-modules');
            });

            const { data } = response;
            
            if (data.status === 1) {
                const modules = (data.modules || []).map(mainModule => ({
                    ...mainModule,
                    icon: this.getModuleIcon(mainModule.name)
                }));
                
                // Update cache
                this.cache.modules = modules;
                this.cache.lastFetch = now;
                
                // Auto-select first module if none is selected
                this.autoSelectFirstModule(modules);
                
                return { success: true, data: modules };
            } else {
                throw new Error(data.message || 'Failed to load modules');
            }
        } catch (error) {
            console.error('ModuleService - fetchModules error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to connect to server',
                shouldRetry: false
            };
        }
    }

    /**
     * Fetch specific module details by ID
     */
    async fetchModuleById(moduleId) {
        try {
            const response = await this.makeApiCall(`/api/main-modules/${moduleId}`, async () => {
                return await this.apiService.vGet(`/api/main-modules/${moduleId}`);
            });

            const { data } = response;
            
            if (data.status === 1) {
                const moduleData = {
                    ...data.module,
                    icon: this.getModuleIcon(data.module.name)
                };
                return { success: true, data: moduleData };
            } else {
                throw new Error(data.message || 'Module not found');
            }
        } catch (error) {
            console.error('ModuleService - fetchModuleById error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to fetch module details',
                shouldRetry: false
            };
        }
    }

    /**
     * Automatically select the first main module if no module is currently selected
     */
    autoSelectFirstModule(modules) {
        if (!modules || modules.length === 0) {
            console.log('ModuleService - No modules available for auto-selection');
            return;
        }

        const currentSelection = this.getSelectedModule();
        
        // Only auto-select if no module is currently selected
        if (!currentSelection) {
            const firstModule = modules[0];
            console.log('ModuleService - Auto-selecting first module:', firstModule.name);
            this.setSelectedModule(firstModule);
            
            // Notify subscribers about the auto-selection
            this.notifySubscribers({
                type: 'MODULE_AUTO_SELECTED',
                payload: firstModule
            });
        } else {
            console.log('ModuleService - Module already selected:', currentSelection.name);
        }
    }

    /**
     * Force selection of the first module (even if another is already selected)
     */
    forceSelectFirstModule(modules = null) {
        const modulesToUse = modules || this.cache.modules;
        
        if (!modulesToUse || modulesToUse.length === 0) {
            console.log('ModuleService - No modules available for force selection');
            return null;
        }

        const firstModule = modulesToUse[0];
        console.log('ModuleService - Force-selecting first module:', firstModule.name);
        this.setSelectedModule(firstModule);
        
        // Notify subscribers about the forced selection
        this.notifySubscribers({
            type: 'MODULE_FORCE_SELECTED',
            payload: firstModule
        });
        
        return firstModule;
    }

    /**
     * Get currently selected module from cookie
     */
    getSelectedModule() {
        return this.getCookie('selectedModule');
    }

    /**
     * Set selected module and save to cookie
     */
    setSelectedModule(moduleData) {
        if (moduleData) {
            this.setCookie('selectedModule', moduleData);
        } else {
            this.deleteCookie('selectedModule');
        }
        
        // Notify all subscribers about the change
        this.notifySubscribers({
            type: 'MODULE_SELECTED',
            payload: moduleData
        });
        
        return moduleData;
    }

    /**
     * Clear selected module
     */
    clearSelectedModule() {
        this.deleteCookie('selectedModule');
        this.notifySubscribers({
            type: 'MODULE_CLEARED',
            payload: null
        });
    }

    /**
     * Subscribe to module changes
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Notify all subscribers of changes
     */
    notifySubscribers(event) {
        this.subscribers.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('ModuleService - subscriber error:', error);
            }
        });
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.modules = null;
        this.cache.lastFetch = null;
        // Also clear retry attempts when clearing cache
        this.retryAttempts.clear();
    }

    /**
     * Clear retry attempts for specific endpoint or all
     */
    clearRetryAttempts(endpoint = null) {
        if (endpoint) {
            this.retryAttempts.delete(endpoint);
        } else {
            this.retryAttempts.clear();
        }
    }

    /**
     * Get cached modules without API call
     */
    getCachedModules() {
        return this.cache.modules;
    }

    /**
     * Check if cache is valid
     */
    isCacheValid() {
        const now = Date.now();
        return this.cache.modules && this.cache.lastFetch && 
               (now - this.cache.lastFetch) < this.cache.cacheTimeout;
    }

    /**
     * Search modules by name or description
     */
    searchModules(query, modules = null) {
        const modulesToSearch = modules || this.cache.modules || [];
        if (!query) return modulesToSearch;
        
        const lowerQuery = query.toLowerCase();
        return modulesToSearch.filter(module => 
            module.name.toLowerCase().includes(lowerQuery) ||
            (module.description && module.description.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get module statistics
     */
    getModuleStats(modules = null) {
        const modulesToAnalyze = modules || this.cache.modules || [];
        return {
            total: modulesToAnalyze.length,
            active: modulesToAnalyze.filter(m => m.status === 1).length,
            inactive: modulesToAnalyze.filter(m => m.status === 0).length,
            lastUpdated: this.cache.lastFetch,
            retryAttempts: Object.fromEntries(this.retryAttempts)
        };
    }

    /**
     * Test API connectivity and token validity
     */
    async testApiConnection() {
        console.log('ModuleService - Testing API connection...');
        
        try {
            const tokenData = this.refreshApiService();
            console.log('ModuleService - Token test data:', {
                hasToken: !!tokenData?.token,
                hasUser: !!tokenData?.user,
                hasAuthorization: !!tokenData?.user?.authorization,
                tokenPreview: tokenData?.token ? `${tokenData.token.substring(0, 20)}...` : 'N/A'
            });

            if (!tokenData?.token || !tokenData?.user) {
                return {
                    success: false,
                    error: 'No token or user data available',
                    details: { tokenData }
                };
            }

            // Try a simple API call
            const response = await this.apiService.vGet('/api/main-modules');
            console.log('ModuleService - Test API response:', response);
            
            return {
                success: true,
                message: 'API connection successful',
                response: response.data
            };
            
        } catch (error) {
            console.error('ModuleService - API connection test failed:', error);
            return {
                success: false,
                error: error.message,
                details: {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                }
            };
        }
    }

    /**
     * Get current retry status
     */
    getRetryStatus() {
        return {
            activeRetries: this.retryAttempts.size,
            attempts: Object.fromEntries(this.retryAttempts)
        };
    }
}

// Create and export singleton instance
const moduleService = new ModuleService();
export default moduleService;
