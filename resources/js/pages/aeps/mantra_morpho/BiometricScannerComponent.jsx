import React, { useState } from "react";

// Helper function to return the primary URL based on the current protocol.
function getPrimaryUrl() {
    const customDomain = "127.0.0.1";
    return window.location.protocol === "https:"
        ? `https://${customDomain}:`
        : `http://${customDomain}:`;
}

/**
 * Fetch with timeout using AbortController
 * Prevents hanging requests on slow/unresponsive ports
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds (default: 3000ms)
 */
async function fetchWithTimeout(url, options = {}, timeout = 3000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
    }
}

/**
 * Scan a single port for biometric device service
 * @param {string} primaryUrl - Base URL (e.g., "http://127.0.0.1:")
 * @param {number} port - Port to scan
 * @returns {Promise<Object>} Port scan result
 */
async function scanPort(primaryUrl, port) {
    const url = `${primaryUrl}${port}`;
    try {
        console.log(`RDSERVICE ${url}`);

        const response = await fetchWithTimeout(url, {
            method: "RDSERVICE",
            headers: { "Content-Type": "text/xml; charset=utf-8" }
        }, 3000);

        if (response.ok) {
            const data = await response.text();
            console.log(`Port ${port} response:`, data);

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const rdService = xmlDoc.getElementsByTagName("RDService")[0];

            if (!rdService) {
                console.warn(`Port ${port}: No RDService element found`);
                return { port, success: false };
            }

            const status = rdService.getAttribute("status");
            const infoAttr = rdService.getAttribute("info") || "";

            console.log(`Port ${port}: status=${status}, info=${infoAttr}`);

            return {
                port,
                success: true,
                status,
                info: infoAttr,
                url,
                xmlDoc,
                rawData: data
            };
        }
    } catch (err) {
        console.warn(`Error scanning port ${port}:`, err.message);
    }
    return { port, success: false };
}

/**
 * Extract device URLs from XML document
 * @param {Document} xmlDoc - Parsed XML document
 * @param {string} baseUrl - Base URL for the device
 * @returns {Object} Object with methodUrl and infoUrl
 */
function extractDeviceUrls(xmlDoc, baseUrl) {
    const interfaces = xmlDoc.getElementsByTagName("Interface");
    let capturePath = interfaces[0]?.getAttribute("path") || "/rd/capture";
    let infoPath = interfaces[1]?.getAttribute("path") || "/rd/info";

    // Fix URL formatting - some devices return full URLs instead of paths
    if (capturePath.startsWith("/127.0.0.1:")) {
        capturePath = capturePath.substring(capturePath.indexOf("/", 12));
    }
    if (infoPath.startsWith("/127.0.0.1:")) {
        infoPath = infoPath.substring(infoPath.indexOf("/", 12));
    }

    return {
        methodUrl: baseUrl + capturePath,
        infoUrl: baseUrl + infoPath
    };
}

/**
 * Scans ports 11100 to 11112 for a biometric device service using parallel scanning.
 * Uses fetch timeout and Promise.allSettled for reliable operation on all devices.
 * @param {string} deviceType - "mantra" or "morpho"
 * @returns {Promise<Object>} Resolves with an object:
 * {
 *   methodUrl: string,    // URL for capture requests
 *   infoUrl: string,      // URL for device info retrieval
 *   port: number,         // the port on which the service was found
 *   rawResponse: string   // the raw XML response from the discovery call
 * }
 */
export async function discoverBiometricDevice(deviceType = "mantra") {
    const primaryUrl = getPrimaryUrl();

    // For Morpho devices, prioritize port 11111
    // For Mantra devices, prioritize port 11101, then 11100, then remaining ports
    const portRange = deviceType.toLowerCase() === "morpho"
        ? [11111, ...Array.from({ length: 13 }, (_, i) => 11100 + i).filter(p => p !== 11111)]
        : [11101, 11100, ...Array.from({ length: 13 }, (_, i) => 11100 + i).filter(p => p !== 11101 && p !== 11100)];

    console.log(`Starting parallel port scan for ${deviceType} device on ports:`, portRange);

    // Scan all ports in parallel for faster discovery
    const scanPromises = portRange.map(port => scanPort(primaryUrl, port));
    const results = await Promise.allSettled(scanPromises);

    // Collect successful scans
    const availableDevices = results
        .filter(r => r.status === 'fulfilled' && r.value.success)
        .map(r => r.value);

    console.log(`Found ${availableDevices.length} responding device(s)`);

    // Helper function to check if device matches target type
    const isTargetDeviceType = (dev) => {
        if (deviceType === "mantra") {
            return dev.info.toLowerCase().includes("mantra");
        }
        return dev.info.toLowerCase().includes("morpho") ||
            dev.info.includes("Morpho_RD_Service") ||
            dev.info.toLowerCase().includes("idemia") ||
            dev.info.includes("IDEMIA_L1_RDSERVICE");
    };

    // Find matching device based on priority order
    // Look for READY/USED devices first (prioritizing by port order)
    let discoveredDevice = null;

    for (const port of portRange) {
        const device = availableDevices.find(dev => dev.port === port);
        if (!device) continue;

        const deviceMatches = isTargetDeviceType(device);

        if (deviceMatches && (device.status === "READY" || device.status === "USED")) {
            discoveredDevice = device;
            console.log(`Device found: ${deviceType} at port ${device.port} (status: ${device.status})`);
            break;
        }
    }

    // Only check for NOTREADY if no READY device was found
    // This prevents false errors when multiple devices exist (e.g., Iris NOTREADY + MFS110 READY)
    if (!discoveredDevice) {
        const notReadyDevice = availableDevices.find(dev => {
            return isTargetDeviceType(dev) && dev.status === "NOTREADY";
        });

        if (notReadyDevice) {
            throw new Error(`${deviceType} device found but reported as NOTREADY. Please check device connection.`);
        }
    }

    // Fallback: try any READY device if no exact match
    if (!discoveredDevice && availableDevices.length > 0) {
        console.log(`No ${deviceType} device found, checking available devices for fallback...`);
        discoveredDevice = availableDevices.find(dev => dev.status === "READY" || dev.status === "USED");
        if (discoveredDevice) {
            console.log(`Using fallback device at port ${discoveredDevice.port}`);
        }
    }

    if (!discoveredDevice) {
        const errorMsg = availableDevices.length > 0
            ? `Found ${availableDevices.length} device(s) but none match ${deviceType} or are ready. Available: ${availableDevices.map(d => `${d.info}(${d.status})`).join(', ')}`
            : "No biometric device services found. Please ensure device is connected and drivers are installed.";
        throw new Error("Discovery failed: " + errorMsg);
    }

    // Extract URLs from discovered device
    const urls = extractDeviceUrls(discoveredDevice.xmlDoc, discoveredDevice.url);

    const discoveryResult = {
        methodUrl: urls.methodUrl,
        infoUrl: urls.infoUrl,
        port: discoveredDevice.port,
        rawResponse: discoveredDevice.rawData
    };

    console.log(`Capture URL: ${discoveryResult.methodUrl}`);
    console.log(`Info URL: ${discoveryResult.infoUrl}`);

    return discoveryResult;
}

/**
 * Sends a biometric capture request using the discovered method URL.
 * @param {string} methodUrl - The URL to send the capture request.
 * @param {boolean} isMantra - Whether the device is Mantra (true) or Morpho (false)
 * @returns {Promise<Object>} Resolves with an object:
 * {
 *   success: boolean,
 *   data: string,    // the raw XML response from the capture call
 *   error: string|null  // error message if any
 * }
 */
export async function captureFingerprint(methodUrl, isMantra = true, otp = "") {
    console.log(`Starting fingerprint capture for ${isMantra ? 'Mantra' : 'Morpho/IDEMIA'} device at: ${methodUrl}`);

    // Build the XML payload - using the same structure for both devices to ensure consistency
    // IDEMIA/Morpho devices can also use the same Mantra XML format
    const DString = '';
    let wadh = "E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=";
    const otpAttr = otp ? ` otp="${otp}"` : '';

    // Use consistent XML payload for all devices (proven to work with Mantra)
    const xmlPayload = '<?xml version="1.0"?> <PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0"' + otpAttr + ' pidVer="2.0" timeout="10000" posh="UNKNOWN" env="P" /> ' + DString + '<CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>';

    console.log('Capture XML payload:', xmlPayload);

    try {
        const response = await fetch(methodUrl, {
            method: "CAPTURE",
            headers: {
                "Content-Type": "text/xml; charset=utf-8"
            },
            body: xmlPayload
        });

        console.log('Capture response status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.text();
            console.log('Capture response data:', data);

            // Parse the XML response.
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const respElem = xmlDoc.getElementsByTagName("Resp")[0];

            if (!respElem) {
                console.error('No Resp element found in response');
                return { success: false, data: data, error: "Invalid response format - no Resp element found" };
            }

            const errCode = respElem.getAttribute("errCode");
            const errInfo = respElem.getAttribute("errInfo");

            console.log(`Capture result: errCode=${errCode}, errInfo=${errInfo}`);

            const isSuccess = errCode === "0";

            return {
                success: isSuccess,
                data: data,
                error: isSuccess ? null : (errInfo || `Error code: ${errCode}`)
            };
        } else {
            const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
            console.error('Capture failed:', errorMsg);
            return { success: false, data: "", error: errorMsg };
        }
    } catch (err) {
        console.error('Capture exception:', err);
        return { success: false, data: "", error: `Network error: ${err.message}` };
    }
}

export async function captureFingerprint1(methodUrl) {
    // Build the XML payload.
    const DString = '';
    let wadh = "E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=";

    let xmlPayload = '<?xml version="1.0"?> <PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0"  wadh="' + wadh + '" pidVer="2.0" timeout="10000" posh="UNKNOWN" env="P" /> ' + DString + '<CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>';

    try {
        const response = await fetch(methodUrl, {
            method: "CAPTURE",
            headers: { "Content-Type": "text/xml; charset=utf-8" },
            body: xmlPayload
        });
        if (response.ok) {
            const data = await response.text();
            // Parse the XML response.
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const respElem = xmlDoc.getElementsByTagName("Resp")[0];
            const errCode = respElem?.getAttribute("errCode");
            const errInfo = respElem?.getAttribute("errInfo");
            return {
                success: errCode === "0",
                data,
                error: errCode === "0" ? null : errInfo || "Unknown error"
            };
        } else {
            return { success: false, data: "", error: `Response error: ${response.status}` };
        }
    } catch (err) {
        return { success: false, data: "", error: err.message };
    }
}

/**
 * Retrieves additional device information from the provided info URL.
 * @param {string} infoUrl - The URL to send the device info request.
 * @returns {Promise<Object>} Resolves with an object:
 * {
 *   success: boolean,
 *   data: string,  // the raw XML response with device info
 *   error: string|null
 * }
 */
export async function retrieveDeviceInformation(infoUrl) {
    console.log(`Retrieving device info from: ${infoUrl}`);
    try {
        const response = await fetch(infoUrl, {
            method: "DEVICEINFO",
            headers: { "Content-Type": "text/xml; charset=utf-8" }
        });
        if (response.ok) {
            const data = await response.text();
            console.log('Device info response:', data);
            return { success: true, data, error: null };
        } else {
            console.error('Device info failed:', response.status, response.statusText);
            return { success: false, data: "", error: `HTTP ${response.status}: ${response.statusText}` };
        }
    } catch (err) {
        console.error('Device info exception:', err);
        return { success: false, data: "", error: `Network error: ${err.message}` };
    }
}

// -----------------------------------------------------------------------
// Below is the React component that leverages all the above functions.
// -----------------------------------------------------------------------

const BiometricScannerComponent = () => {
    // State for the chosen device type ("mantra" or "morpho")
    const [deviceType, setDeviceType] = useState("mantra");
    const [discoveryResult, setDiscoveryResult] = useState(null);
    const [fingerprintResult, setFingerprintResult] = useState(null);
    const [deviceInfo, setDeviceInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState("");

    // Function to run all operations sequentially.
    const performBiometricOperations = async () => {
        setLoading(true);
        setNotification("Starting discovery...");
        setDiscoveryResult(null);
        setFingerprintResult(null);
        setDeviceInfo("");

        try {
            // Discover the biometric device.
            const discoveryData = await discoverBiometricDevice(deviceType);
            setDiscoveryResult(discoveryData);
            setNotification(`Device discovered at port ${discoveryData.port}.`);

            // Capture the fingerprint using the discovered method URL.
            const captureData = await captureFingerprint(discoveryData.methodUrl, deviceType === "mantra");
            setFingerprintResult(captureData);
            if (captureData.success) {
                setNotification("Fingerprint captured successfully.");
            } else {
                setNotification("Fingerprint capture failed: " + captureData.error);
            }

            // Retrieve additional device information.
            const infoData = await retrieveDeviceInformation(discoveryData.infoUrl);
            if (infoData.success) {
                setDeviceInfo(infoData.data);
            }
        } catch (err) {
            setNotification("Error: " + err.message);
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <h2>Unified Biometric Scanner</h2>
            <div style={styles.section}>
                <label>
                    <strong>Select Device Type:</strong>
                </label>
                <div style={styles.radioGroup}>
                    <label>
                        <input
                            type="radio"
                            value="mantra"
                            checked={deviceType === "mantra"}
                            onChange={() => setDeviceType("mantra")}
                        />
                        Mantra
                    </label>
                    <label style={{ marginLeft: "1rem" }}>
                        <input
                            type="radio"
                            value="morpho"
                            checked={deviceType === "morpho"}
                            onChange={() => setDeviceType("morpho")}
                        />
                        Morpho
                    </label>
                </div>
            </div>
            <div style={styles.section}>
                <button onClick={performBiometricOperations} disabled={loading}>
                    {loading ? "Processing..." : "Run Biometric Operations"}
                </button>
            </div>
            <div style={styles.section}>
                {notification && <p style={styles.notification}>{notification}</p>}
            </div>
            {discoveryResult && (
                <div style={styles.section}>
                    <h3>Discovery Data</h3>
                    <p>
                        <strong>Method URL:</strong>{" "}
                        <span style={styles.urlValue}>{discoveryResult.methodUrl}</span>
                    </p>
                    <p>
                        <strong>Info URL:</strong>{" "}
                        <span style={styles.urlValue}>{discoveryResult.infoUrl}</span>
                    </p>
                    <p>
                        <strong>Discovered Port:</strong> {discoveryResult.port}
                    </p>
                </div>
            )}
            {fingerprintResult && (
                <div style={styles.section}>
                    <h3>Fingerprint Capture Result</h3>
                    <pre style={styles.preformatted}>{fingerprintResult.data}</pre>
                    {fingerprintResult.error && (
                        <p style={styles.errorMsg}>
                            Capture Error: {fingerprintResult.error}
                        </p>
                    )}
                </div>
            )}
            {deviceInfo && (
                <div style={styles.section}>
                    <h3>Device Information</h3>
                    <pre style={styles.preformatted}>{deviceInfo}</pre>
                </div>
            )}
        </div>
    );
};

// Inline styles for the component.
const styles = {
    container: {
        maxWidth: "700px",
        margin: "20px auto",
        padding: "1rem",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f8f8f8",
    },
    section: {
        marginBottom: "1.5rem",
    },
    radioGroup: {
        marginTop: "0.5rem",
    },
    urlValue: {
        fontFamily: "monospace",
    },
    notification: {
        color: "#006600",
        fontWeight: "bold",
    },
    errorMsg: {
        color: "#c00",
        fontWeight: "bold",
    },
    preformatted: {
        backgroundColor: "#e8e8e8",
        padding: "0.5rem",
        borderRadius: "4px",
        overflowX: "auto",
        fontFamily: "monospace",
    },
};

export default BiometricScannerComponent;