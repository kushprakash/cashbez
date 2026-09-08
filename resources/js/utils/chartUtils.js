/**
 * Chart initialization utilities for legacy chart scripts
 * This helps prevent "Element not found" errors when DOM elements don't exist
 */

/**
 * Safely initialize a chart only if the target element exists
 * @param {string} selector - CSS selector for the chart container
 * @param {Function} initFunction - Function to initialize the chart
 * @param {string} chartName - Name of the chart for debugging
 */
export const safeInitChart = (selector, initFunction, chartName = 'Chart') => {
    const element = document.querySelector(selector);
    if (element) {
        try {
            return initFunction(element);
        } catch (error) {
            console.warn(`Failed to initialize ${chartName}:`, error);
        }
    } else {
        console.warn(`${chartName} container not found: ${selector}`);
    }
    return null;
};

/**
 * Wait for DOM element to be available and then initialize chart
 * @param {string} selector - CSS selector for the chart container
 * @param {Function} initFunction - Function to initialize the chart
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
export const waitForElementAndInit = (selector, initFunction, timeout = 5000) => {
    const startTime = Date.now();
    
    const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
            try {
                return initFunction(element);
            } catch (error) {
                console.warn(`Failed to initialize chart for ${selector}:`, error);
            }
        } else if (Date.now() - startTime < timeout) {
            // Element not found yet, try again in 100ms
            setTimeout(checkElement, 100);
        } else {
            console.warn(`Timeout waiting for element: ${selector}`);
        }
    };
    
    checkElement();
};

/**
 * Initialize multiple charts safely
 * @param {Array} chartConfigs - Array of {selector, initFunction, name} objects
 */
export const initMultipleCharts = (chartConfigs) => {
    chartConfigs.forEach(({ selector, initFunction, name }) => {
        safeInitChart(selector, initFunction, name);
    });
};

/**
 * Check if all required chart libraries are loaded
 * @param {Array} libraries - Array of library names to check
 */
export const checkLibrariesLoaded = (libraries = []) => {
    const missing = libraries.filter(lib => typeof window[lib] === 'undefined');
    if (missing.length > 0) {
        console.warn('Missing chart libraries:', missing);
        return false;
    }
    return true;
};
