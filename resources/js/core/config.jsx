// config.js

export const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY || "";
export const AppName = import.meta.env.VITE_APP_APP_NAME || "";
export const baseUrl = import.meta.env.VITE_APP_BASE_URL || "";
export const assetUrl = import.meta.env.VITE_APP_ASSET_URL || "";
export const apiUrl = import.meta.env.VITE_APP_API_URL || "";

// console.log("process: ", process);
// console.log("process.env: ", process.env);
// console.log("SECRET_KEY: ", baseUrl);