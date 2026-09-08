import ApiService from "./ApiService";
import { retrieveTokenAndUserData } from "../auth/tokenManager";

/**
 * Service to handle Popup related API calls
 */
export const PopupService = {
    /**
     * Fetch applicable popup for current user on specified screen
     * @param {string} screen - The screen identifier (e.g., 'home', 'login')
     * @returns {Promise<Object|null>} Popup data or null
     */
    fetchPopup: async (screen = 'home') => {
        try {
            const { token, user } = retrieveTokenAndUserData() || {};
            
            // If no token, we can't fetch authenticated popup
            if (!token) return null;

            const apiService = ApiService();
            const response = await apiService.vPost('/api/popup/fetch', { 
                screen,
                user_id: user?.id 
            });

            if (response.data && response.data.status === 1 && response.data.data?.popup) {
                return response.data.data.popup;
            }
            return null;
        } catch (error) {
            console.error('Error fetching popup:', error);
            return null;
        }
    },

    /**
     * Fetch public popup for guest users (using user_id)
     * @param {number} userId - User ID from roles
     * @param {string} screen - Screen identifier
     * @returns {Promise<Object|null>} Popup data or null
     */
    fetchPublicPopup: async (userId, screen = 'login') => {
        try {
            if (!userId) return null;

            const apiService = ApiService();
             // Use .post() for public/unauthenticated requests (uses axiosDefault internally)
            const response = await apiService.post('/api/popup/public', { user_id: userId, screen });

            if (response && response.status === 1 && response.data?.popup) {
               return response.data.popup;
            }

             
            return null;
        } catch (error) {
            console.error('Error fetching public popup:', error);
            return null;
        }
    },

    /**
     * Dismiss a popup for the authenticated user
     * @param {number} popupId 
     * @returns {Promise<boolean>} Success status
     */
    dismissPopup: async (popupId) => {
        try {
            const { token, user } = retrieveTokenAndUserData() || {};
            if (!token) return false;

            const apiService = ApiService();
            const response = await apiService.vPost('/api/popup/dismiss', { 
                popup_id: popupId,
                user_id: user?.id 
            });

            return response.data && response.data.status === 1;
        } catch (error) {
            console.error('Error dismissing popup:', error);
            return false;
        }
    }
};
