/**
 * React rendering utilities to prevent common errors
 */

/**
 * Safely renders a value, ensuring it's not an object
 * @param {any} value - The value to render
 * @param {string} fallback - Fallback value if rendering is not safe
 * @returns {string|number|null} Safe value to render
 */
export const safeRender = (value, fallback = '-') => {
    // If value is null, undefined, or empty string, return fallback
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    
    // If value is a primitive (string, number, boolean), return it
    if (typeof value !== 'object') {
        return value;
    }
    
    // If value is an array, don't render it directly
    if (Array.isArray(value)) {
        console.warn('Attempted to render array directly:', value);
        return fallback;
    }
    
    // If value is an object, don't render it directly
    console.warn('Attempted to render object directly:', value);
    return fallback;
};

/**
 * Safely extracts a nested property from an object
 * @param {object} obj - The object to extract from
 * @param {string} path - Dot-separated path to the property (e.g., 'user.profile.name')
 * @param {any} fallback - Fallback value if property doesn't exist
 * @returns {any} The extracted value or fallback
 */
export const safeGet = (obj, path, fallback = null) => {
    try {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj) ?? fallback;
    } catch (error) {
        console.warn('Error accessing path:', path, 'in object:', obj, error);
        return fallback;
    }
};

/**
 * Safely renders a nested object property
 * @param {object} obj - The object containing the property
 * @param {string} path - Dot-separated path to the property
 * @param {string} fallback - Fallback value for display
 * @returns {string|number|null} Safe value to render
 */
export const safeRenderPath = (obj, path, fallback = '-') => {
    const value = safeGet(obj, path, null);
    return safeRender(value, fallback);
};

/**
 * Creates a safe badge component for status-like objects
 * @param {object|string} statusObj - Status object or string
 * @param {string} nameField - Field name containing the display text (default: 'name')
 * @param {string} colorField - Field name containing the color (default: 'color')
 * @param {string} fallback - Fallback text if status is invalid
 * @returns {object} Props for badge rendering
 */
export const safeBadgeProps = (statusObj, nameField = 'name', colorField = 'color', fallback = 'N/A') => {
    if (typeof statusObj === 'string') {
        return { text: statusObj, color: null };
    }
    
    if (!statusObj || typeof statusObj !== 'object') {
        return { text: fallback, color: null };
    }
    
    return {
        text: safeRender(statusObj[nameField], fallback),
        color: statusObj[colorField] || null
    };
};

/**
 * Safely formats a date string
 * @param {string|Date} date - Date to format
 * @param {string} fallback - Fallback text for invalid dates
 * @returns {string} Formatted date or fallback
 */
export const safeFormatDate = (date, fallback = '-') => {
    if (!date) return fallback;
    
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return fallback;
        }
        return dateObj.toLocaleDateString();
    } catch (error) {
        console.warn('Error formatting date:', date, error);
        return fallback;
    }
};

export default {
    safeRender,
    safeGet,
    safeRenderPath,
    safeBadgeProps,
    safeFormatDate
};
