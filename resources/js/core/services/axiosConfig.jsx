import axios from 'axios';
import { apiUrl } from '../config';


// Base configuration for Axios
const baseConfig = {
    baseURL: apiUrl
};

// Function to create an Axios instance with authorization
const createAxiosInstance = (authToken = null, contentType = 'application/json', authrization = null) => {
    const headers = {
        ...baseConfig.headers,
        'content-type': contentType,
        ...(authToken && { 'token': `${authToken}` }),
        ...(authrization && { 'authorizations': authrization }),
    };

    return axios.create({
        ...baseConfig,
        headers,
    });
};

// Create axios instance with token
export const axiosAuthorization = (authToken, authrization) => createAxiosInstance(authToken, 'application/json', authrization);

// Create axios instance with token
export const axiosInstance = (authToken) => createAxiosInstance(authToken);

// Create axios instance for file uploads with token and authorization
export const axiosFile = (authToken, authorization) => {
    const headers = {
        ...(authToken && { 'token': `${authToken}` }),
        ...(authorization && { 'authorizations': authorization }),
    };
    
    return axios.create({
        ...baseConfig,
        headers,
    });
};

// Create default Axios instance (no Authorization header)
export const axiosDefault = () => createAxiosInstance();

export const axiosMext = (authrization) => createAxiosInstance(null, 'application/json', authrization);
