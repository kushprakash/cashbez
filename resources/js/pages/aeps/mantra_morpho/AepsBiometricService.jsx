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

    // For Mantra devices, prioritize ports 11100 and 11101
    // For Morpho devices, prioritize port 11111
    const portRange = deviceType.toLowerCase() === "mantra"
        ? [11100, 11101, ...Array.from({ length: 13 }, (_, i) => 11100 + i).filter(p => p !== 11100 && p !== 11101)]
        : deviceType.toLowerCase() === "morpho"
            ? [11111, ...Array.from({ length: 13 }, (_, i) => 11100 + i).filter(p => p !== 11111)]
            : Array.from({ length: 13 }, (_, i) => 11100 + i);

    for (let port of portRange) {
        const url = `${primaryUrl}${port}`;
        try {
            // Send discovery request using the custom HTTP method "RDSERVICE"
            const response = await fetch(url, {
                method: "RDSERVICE",
                headers: { "Content-Type": "text/xml; charset=utf-8" }
            });
            if (response.ok) {
                const data = await response.text();
                // Save the raw response for debugging or further processing.
                discoveryResult.rawResponse = data;

                // Parse the XML response
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                const rdService = xmlDoc.getElementsByTagName("RDService")[0];
                if (!rdService) continue;
                const status = rdService.getAttribute("status");
                const infoAttr = rdService.getAttribute("info");

                // Check for keywords based on deviceType.
                if (
                    (deviceType === "mantra" && infoAttr.includes("Mantra")) ||
                    (deviceType === "morpho" && infoAttr.includes("Morpho_RD_Service"))
                ) {
                    // Grab capture and info endpoints from <Interface> tags.
                    const interfaces = xmlDoc.getElementsByTagName("Interface");
                    const capturePath = interfaces[0]?.getAttribute("path") || "";
                    const infoPath = interfaces[1]?.getAttribute("path") || "";
                    if (status === "READY" || status === "USED") {
                        discoveryResult.methodUrl = url + capturePath;
                        discoveryResult.infoUrl = url + infoPath;
                        discoveryResult.port = port;
                        discovered = true;
                        break;
                    } else if (status === "NOTREADY") {
                        throw new Error("Device reported as NOTREADY.");
                    }
                }
            }
        } catch (err) {
            console.warn(`Error scanning port ${port}: ${err}`);
            // Continue with the next port even if an error occurs.
        }
    }
    if (!discovered) {
        throw new Error("Discovery failed: Unable to find a responsive device service.");
    }
    return discoveryResult;
}

/**
 * Sends a biometric capture request using the discovered method URL.
 * @param {string} methodUrl - The URL to send the capture request.
 * @returns {Promise<Object>} Resolves with an object:
 * {
 *   success: boolean,
 *   data: string,    // the raw XML response from the capture call
 *   error: string|null  // error message if any
 * }
 */
export async function captureFingerprint(methodUrl, aeps = false, otp = "") {
    // Build the XML payload.
    const DString = '';
    let wadh = "E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=";
    if (aeps) {
        wadh = '';
    }
    // For eKYC FMR transactions, use fType="2" (fingerprint minutiae)
    // For FIR transactions, use fType="0" (fingerprint image)
    const fTypeForEkyc = aeps ? "2" : "2"; // Force FMR for both AEPS and eKYC
    const otpAttr = otp ? ` otp="${otp}"` : '';
    const xmlPayload = `<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="${fTypeForEkyc}" iCount="0" format="0"${otpAttr} pidVer="2.0" timeout="15000" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=" posh="UNKNOWN" /></PidOptions>`;

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
    try {
        const response = await fetch(infoUrl, {
            method: "DEVICEINFO",
            headers: { "Content-Type": "text/xml; charset=utf-8" }
        });
        if (response.ok) {
            const data = await response.text();
            return { success: true, data, error: null };
        } else {
            return { success: false, data: "", error: `Response error: ${response.status}` };
        }
    } catch (err) {
        return { success: false, data: "", error: err.message };
    }
}

// -----------------------------------------------------------------------
// Below is the React component that leverages all the above functions.
// -----------------------------------------------------------------------

const AepsBiometricService = () => {
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
            const captureData = await captureFingerprint(discoveryData.methodUrl);
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

export default AepsBiometricService;