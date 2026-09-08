import React, { useState } from "react";

// Helper function to return the primary URL based on the current protocol.
function getPrimaryUrl() {
    const customDomain = "127.0.0.1";
    return window.location.protocol === "https:"
        ? `https://${customDomain}:`
        : `http://${customDomain}:`;
}

/**
 * Scans ports 11100 to 11112 for a biometric device service.
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
    let discovered = false;
    let discoveryResult = {
        methodUrl: "",
        infoUrl: "",
        port: null,
        rawResponse: ""
    };

    let availableDevices = [];

    // For Morpho devices, prioritize port 11111
    const portRange = deviceType.toLowerCase() === "morpho"
        ? [11111, ...Array.from({ length: 13 }, (_, i) => 11100 + i).filter(p => p !== 11111)]
        : Array.from({ length: 13 }, (_, i) => 11100 + i);

    for (let port of portRange) {
        const url = `${primaryUrl}${port}`;
        try {
            console.log(`RDSERVICE ${url}`);

            // Send discovery request using the custom HTTP method "RDSERVICE"
            const response = await fetch(url, {
                method: "RDSERVICE",
                headers: { "Content-Type": "text/xml; charset=utf-8" }
            });

            if (response.ok) {
                const data = await response.text();
                console.log(`Port ${port} response:`, data);

                // Save the raw response for debugging or further processing.
                discoveryResult.rawResponse = data;

                // Parse the XML response
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                const rdService = xmlDoc.getElementsByTagName("RDService")[0];

                if (!rdService) {
                    console.warn(`Port ${port}: No RDService element found`);
                    continue;
                }

                const status = rdService.getAttribute("status");
                const infoAttr = rdService.getAttribute("info") || "";

                console.log(`Port ${port}: status=${status}, info=${infoAttr}`);

                // Store available device info for fallback
                availableDevices.push({
                    port,
                    status,
                    info: infoAttr,
                    url,
                    xmlDoc
                });

                // Check for keywords based on deviceType with improved matching
                const isMantraDevice = infoAttr.toLowerCase().includes("mantra");
                const isMorphoDevice = infoAttr.toLowerCase().includes("morpho") ||
                    infoAttr.includes("Morpho_RD_Service") ||
                    infoAttr.toLowerCase().includes("idemia") ||
                    infoAttr.includes("IDEMIA_L1_RDSERVICE");

                const deviceMatches = (
                    (deviceType === "mantra" && isMantraDevice) ||
                    (deviceType === "morpho" && isMorphoDevice)
                );

                if (deviceMatches && (status === "READY" || status === "USED")) {
                    // Grab capture and info endpoints from <Interface> tags.
                    const interfaces = xmlDoc.getElementsByTagName("Interface");
                    let capturePath = interfaces[0]?.getAttribute("path") || "/rd/capture";
                    let infoPath = interfaces[1]?.getAttribute("path") || "/rd/info";

                    // Fix URL formatting - some devices return full URLs instead of paths
                    if (capturePath.startsWith("/127.0.0.1:")) {
                        // Extract the path part after the port
                        capturePath = capturePath.substring(capturePath.indexOf("/", 12));
                    }
                    if (infoPath.startsWith("/127.0.0.1:")) {
                        // Extract the path part after the port
                        infoPath = infoPath.substring(infoPath.indexOf("/", 12));
                    }

                    discoveryResult.methodUrl = url + capturePath;
                    discoveryResult.infoUrl = url + infoPath;
                    discoveryResult.port = port;
                    discovered = true;
                    console.log(`Device found: ${deviceType} at port ${port}`);
                    console.log(`Capture URL: ${discoveryResult.methodUrl}`);
                    console.log(`Info URL: ${discoveryResult.infoUrl}`);
                    break;
                } else if (deviceMatches && status === "NOTREADY") {
                    throw new Error(`${deviceType} device found but reported as NOTREADY. Please check device connection.`);
                }
            }
        } catch (err) {
            if (err.message.includes("NOTREADY")) {
                throw err; // Re-throw NOTREADY errors
            }
            console.warn(`Error scanning port ${port}:`, err.message);
        }
    }

    // If no device found for the specific type, try to use any available device as fallback
    if (!discovered && availableDevices.length > 0) {
        console.log(`No ${deviceType} device found, checking available devices:`, availableDevices);

        // Try to use any READY device as fallback
        const readyDevice = availableDevices.find(dev => dev.status === "READY" || dev.status === "USED");
        if (readyDevice) {
            console.log(`Using fallback device at port ${readyDevice.port}`);
            const interfaces = readyDevice.xmlDoc.getElementsByTagName("Interface");
            let capturePath = interfaces[0]?.getAttribute("path") || "/rd/capture";
            let infoPath = interfaces[1]?.getAttribute("path") || "/rd/info";

            // Fix URL formatting - some devices return full URLs instead of paths
            if (capturePath.startsWith("/127.0.0.1:")) {
                capturePath = capturePath.substring(capturePath.indexOf("/", 12));
            }
            if (infoPath.startsWith("/127.0.0.1:")) {
                infoPath = infoPath.substring(infoPath.indexOf("/", 12));
            }

            discoveryResult.methodUrl = readyDevice.url + capturePath;
            discoveryResult.infoUrl = readyDevice.url + infoPath;
            discoveryResult.port = readyDevice.port;
            discoveryResult.rawResponse = readyDevice.xmlDoc.documentElement.outerHTML;
            discovered = true;
            console.log(`Fallback URLs: capture=${discoveryResult.methodUrl}, info=${discoveryResult.infoUrl}`);
        }
    }

    if (!discovered) {
        const errorMsg = availableDevices.length > 0
            ? `Found ${availableDevices.length} device(s) but none match ${deviceType} or are ready. Available: ${availableDevices.map(d => `${d.info}(${d.status})`).join(', ')}`
            : "No biometric device services found. Please ensure device is connected and drivers are installed.";
        throw new Error("Discovery failed: " + errorMsg);
    }

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