import ApiService from './ApiService';

class KycService {
    static kycCheckInProgress = false;
    static kycStatusCache = null;
    static cacheTime = null;
    static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Check if KYC is required for the current user
     * @returns {Promise<{required: boolean, redirect?: string, kycData?: object}>}
     */
    static async checkKycStatus() {
        // Prevent multiple simultaneous checks
        if (this.kycCheckInProgress) {
            return { required: false };
        }

        // Check cache first
        if (this.kycStatusCache && this.cacheTime &&
            (Date.now() - this.cacheTime) < this.CACHE_DURATION) {
            return this.kycStatusCache;
        }

        try {
            this.kycCheckInProgress = true;
            const apiService = ApiService();

            const response = await apiService.vGet('/api/kyc/status');

            if (response.data.status === 1) {
                const { kyc, user_role, is_corporate } = response.data;

                let kycCompleted = false;

                // Check KYC completion based on user role
                if (is_corporate) {
                    // Corporate user - need complete corporate KYC
                    kycCompleted = kyc.aadhar_verified &&
                        kyc.pan_verified &&
                        kyc.account_verified &&
                        kyc.kyc_completed;
                } else {
                    // Individual user - need basic KYC (Aadhaar + PAN)
                    kycCompleted = kyc.aadhar_verified && kyc.pan_verified && kyc.account_verified;
                }

                const result = {
                    required: !kycCompleted,
                    redirect: !kycCompleted ? '/users/kyc' : null,
                    kycData: kyc,
                    userRole: user_role,
                    isCorporate: is_corporate
                };

                // Cache the result
                this.kycStatusCache = result;
                this.cacheTime = Date.now();

                return result;
            } else {
                // KYC record doesn't exist - redirect to KYC
                const result = {
                    required: true,
                    redirect: '/users/kyc',
                    kycData: null,
                    userRole: response.data.user_role || 1,
                    isCorporate: response.data.is_corporate || false
                };

                this.kycStatusCache = result;
                this.cacheTime = Date.now();

                return result;
            }
        } catch (error) {
            console.error('KYC status check failed:', error);
            // Don't block user flow if KYC check fails
            return { required: false };
        } finally {
            this.kycCheckInProgress = false;
        }
    }

    /**
     * Clear KYC status cache
     */
    static clearCache() {
        this.kycStatusCache = null;
        this.cacheTime = null;
    }

    /**
     * Check if user is admin (skip KYC check)
     * @param {object} user 
     * @returns {boolean}
     */
    static isAdmin(user) {
        return user && (user.role === 1 || user.role === '1');
    }

    /**
     * Get redirect path based on current KYC status
     * @returns {Promise<string|null>}
     */
    static async getRedirectPath() {
        const status = await this.checkKycStatus();
        return status.redirect;
    }
}

export default KycService;
