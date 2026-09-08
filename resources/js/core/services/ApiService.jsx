import { axiosAuthorization, axiosDefault, axiosFile, axiosInstance, axiosMext } from "../../core/services/axiosConfig";
import {
    decryptData,
    decryptDataFromAPI,
    encryptData,
    encryptDataForAPI,
    encryptIdForAPI
} from "../auth/cryptoUtils";
import { retrieveTokenAndUserData } from "../auth/tokenManager";

// Helper function to handle KYC redirect response
const handleKycResponse = (response) => {
    if (response.data && response.data.kyc_required) {
        // Clear KYC cache to force fresh check
        import('./KycService').then(KycService => {
            KycService.default.clearCache();
        });
        
        // Show toast notification if available
        if (window.toast) {
            window.toast.warning(response.data.message || 'KYC verification required');
        }
        
        // Navigate to KYC page
        if (response.data.redirect && window.location.pathname !== response.data.redirect) {
            window.location.href = response.data.redirect;
        }
    }
    return response;
};

const ApiService = () => {
    const { token: authToken, user } = retrieveTokenAndUserData() || {};
    const defaultHttp = axiosDefault();
    const http = axiosInstance(authToken);
    const httpAuth = axiosAuthorization(authToken, user?.authorization);
    const httpFile = axiosFile(authToken, user?.authorization);

    // Dynamic request: encryption, token, etc.
    const request = async ({ endpoint, data = {}, method = 'post', encrypt = false, useToken = false, file = false }) => {
        let client = defaultHttp;
        let payload = data;
        if (useToken && encrypt) {
            // Encrypted with token
            const { encryptedData, iv } = encryptDataForAPI(data, token);
            const formData = new FormData();
            formData.append('data', encryptedData);
            formData.append('iv', iv);
            client = file ? httpFile : http;
            payload = formData;
        } else if (useToken) {
            client = file ? httpFile : http;
        } else if (encrypt) {
            const { encryptedData, iv, salt } = encryptData(data);
            const formData = new FormData();
            formData.append('data', encryptedData);
            formData.append('iv', iv);
            formData.append('salt', salt);
            payload = formData;
        }
        try {
            const res = await client[method](endpoint, payload);
            if (encrypt) {
                // Decrypt if needed
                if (res.data?.encryptedData && res.data?.iv) {
                    return decryptDataFromAPI(res.data.encryptedData, res.data.iv, token);
                }
            }
            return res.data;
        } catch (error) {
            console.error(`Error at ${endpoint}:`, error);
            throw error;
        }
    };

    return {
        request,
        post: async (endpoint, data) => request({ endpoint, data, method: 'post' }),
        get: async (endpoint, params) => http.get(endpoint, { params }),
        postEncrypted: async (endpoint, data) => request({ endpoint, data, method: 'post', encrypt: true, useToken: true }),
        vPost: async (endpoint, data) => {
            try {
                const response = await httpAuth.post(endpoint, data);
                handleKycResponse(response);
                return response;
            } catch (error) {
                console.error(`Error at ${endpoint}:`, error);
                throw error;
            }
        },
        vGet: async (endpoint, data) => {
            try {
                const response = await httpAuth.get(endpoint, data);
                handleKycResponse(response);
                return response;
            } catch (error) {
                console.error(`Error at ${endpoint}:`, error);
                throw error;
            }
        },
        vPut: async (endpoint, data) => {
            try {
                const response = await httpAuth.put(endpoint, data);
                handleKycResponse(response);
                return response;
            } catch (error) {
                console.error(`Error at ${endpoint}:`, error);
                throw error;
            }
        },
        vDelete: async (endpoint) => {
            try {
                const response = await httpAuth.delete(endpoint);
                handleKycResponse(response);
                return response;
            } catch (error) {
                console.error(`Error at ${endpoint}:`, error);
                throw error;
            }
        },

        postWithFile: async (endpoint, data, files = {}) => {
            try {
                const formData = new FormData();
                
                // Add regular data fields
                if (data && typeof data === 'object') {
                    Object.keys(data).forEach(key => {
                        if (data[key] !== null && data[key] !== undefined) {
                            formData.append(key, data[key]);
                        }
                    });
                }
                
                // Add files
                if (files && typeof files === 'object') {
                    Object.keys(files).forEach(key => {
                        if (files[key] instanceof File || files[key] instanceof Blob) {
                            formData.append(key, files[key]);
                        } else if (Array.isArray(files[key])) {
                            // Handle multiple files for the same field
                            files[key].forEach((file, index) => {
                                if (file instanceof File || file instanceof Blob) {
                                    formData.append(`${key}[${index}]`, file);
                                }
                            });
                        }
                    });
                }
                
                const response = await httpFile.post(endpoint, formData);
                handleKycResponse(response);
                return response;
            } catch (error) {
                console.error(`Error uploading file to ${endpoint}:`, error);
                throw error;
            }
        },
        putWithFile: async (endpoint, data, files = {}) => {
            try {
                const formData = new FormData();
                
                // Add _method for Laravel method spoofing
                formData.append('_method', 'PUT');
                
                // Add regular data fields
                if (data && typeof data === 'object') {
                    Object.keys(data).forEach(key => {
                        if (data[key] !== null && data[key] !== undefined) {
                            formData.append(key, data[key]);
                        }
                    });
                }
                
                // Add files
                if (files && typeof files === 'object') {
                    Object.keys(files).forEach(key => {
                        if (files[key] instanceof File || files[key] instanceof Blob) {
                            formData.append(key, files[key]);
                        } else if (Array.isArray(files[key])) {
                            // Handle multiple files for the same field
                            files[key].forEach((file, index) => {
                                if (file instanceof File || file instanceof Blob) {
                                    formData.append(`${key}[${index}]`, file);
                                }
                            });
                        }
                    });
                }
                
                const response = await httpFile.post(endpoint, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } catch (error) {
                console.error(`Error at ${endpoint}:`, error);
                throw error;
            }
        },
        updateSettings: async (endpoint, settingsData, fileUploads = {}) => {
            try {
                const formData = new FormData();
                
                // Add _method for Laravel method spoofing
                formData.append('_method', 'PUT');
                
                // Add all settings data
                Object.keys(settingsData).forEach(key => {
                    if (settingsData[key] !== null && settingsData[key] !== undefined) {
                        formData.append(key, settingsData[key]);
                    }
                });
                
                // Add file uploads (logo, footer_logo, favicon, etc.)
                Object.keys(fileUploads).forEach(key => {
                    if (fileUploads[key] instanceof File || fileUploads[key] instanceof Blob) {
                        formData.append(key, fileUploads[key]);
                    }
                });
                
                const response = await httpFile.post(endpoint, formData);
                handleKycResponse(response);
                return response;
            } catch (error) {
                console.error(`Error updating settings at ${endpoint}:`, error);
                throw error;
            }
        },
        // Get all items
        getAll: async (endpoint) => request({ endpoint, method: 'get', useToken: true, encrypt: true }),

        // Get a single item by ID
        getById: async (endpoint, id) => {
            try {
                const { encryptedId, iv } = encryptIdForAPI(id, token);
                const response = await http.get(`${endpoint}/${encryptedId}`, { params: { iv } });
                const decryptedData = decryptDataFromAPI(response.data.encryptedData, response.data.iv, token);
                return decryptedData;
            } catch (error) {
                console.error(`Error fetching data from ${endpoint}/${id}:`, error);
                throw error;
            }
        },

        // Create a new item
        create: async (endpoint, data) => {
            try {
                const { encryptedData, iv } = encryptDataForAPI(data, token);
                const formData = new FormData();
                formData.append('data', encryptedData);
                formData.append('iv', iv);

                const response = await httpFile.post(endpoint, formData);
                const decryptedData = decryptDataFromAPI(response.data.encryptedData, response.data.iv, token);
                return decryptedData;
            } catch (error) {
                console.error(`Error creating data at ${endpoint}:`, error);
                throw error;
            }
        },

        // Update an existing item
        update: async (endpoint, id, data) => {
            try {
                const { encryptedId, iv: idIv } = encryptIdForAPI(id, token);
                const { encryptedData, iv } = encryptDataForAPI(data, token);
                const formData = new FormData();
                formData.append('id', encryptedId);
                formData.append('idIv', idIv);
                formData.append('data', encryptedData);
                formData.append('dataIv', iv);

                const response = await httpFile.put(`${endpoint}/${encryptedId}`, formData);
                const decryptedData = decryptDataFromAPI(response.data.encryptedData, response.data.iv, token);
                return decryptedData;
            } catch (error) {
                console.error(`Error updating data at ${endpoint}/${id}:`, error);
                throw error;
            }
        },

        // Delete an item
        delete: async (endpoint, id) => {
            try {
                const { encryptedId, iv } = encryptIdForAPI(id, token);
                const response = await http.delete(`${endpoint}/${encryptedId}`, { params: { iv } });
                const decryptedData = decryptDataFromAPI(response.data.encryptedData, response.data.iv, token);
                return decryptedData;
            } catch (error) {
                console.error(`Error deleting data at ${endpoint}/${id}:`, error);
                throw error;
            }
        }
    };
};

export default ApiService;
