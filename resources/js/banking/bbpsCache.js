// In-memory cache for BBPS categories, operators, accounts, and preloaded icons

const cacheMap = new Map();

export const getBbpsCache = (key) => {
    return cacheMap.get(key) || null;
};

export const setBbpsCache = (key, data) => {
    cacheMap.set(key, data);
};

export const clearBbpsCache = (key) => {
    if (key) {
        cacheMap.delete(key);
    } else {
        cacheMap.clear();
    }
};

// Preload icons into browser memory for instant rendering
export const preloadIcons = (urls = []) => {
    if (!Array.isArray(urls)) return;
    urls.forEach((url) => {
        if (url && typeof url === 'string') {
            const img = new Image();
            img.src = url;
        }
    });
};
