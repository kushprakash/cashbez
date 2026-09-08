import { useEffect, useState, useRef } from "react";
import { discoverBiometricDevice, captureFingerprint } from './mantra_morpho/AepsBiometricService';
import ApiService from '../services/ApiService';
import { notify } from '../components/Toast';
import { useNavigate } from "react-router-dom";
import { retrieveTokenAndUserData, storeTokenAndUserData } from "../services/tokenManager";
import npciLogo from '../assets/npci-logo.png'; // Ensure you have the NPCI logo in your assets folder
import { XMLParser } from 'fast-xml-parser';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  },
  header: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  shield: {
    marginRight: '10px',
    backgroundColor: '#f5f3ff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#6c5ce7',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#f5f3ff',
    marginBottom: '10px',
    borderRadius: '3px',
  },
  progress: {
    width: '50%',
    height: '100%',
    backgroundColor: '#6c5ce7',
    borderRadius: '3px',
  },
  icons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    position: 'relative',
    padding: '0 0px',
  },
  iconContainer: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f5f3ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#6c5ce7',
    border: '2px solid #6c5ce7',
  },
  iconCircleInactive: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#a8a8a8',
    border: '2px solid #e0e0e0',
  },
  iconText: {
    fontSize: '12px',
    color: '#6c5ce7',
    fontWeight: '500',
  },
  iconTextInactive: {
    fontSize: '14px',
    color: '#a8a8a8',
    fontWeight: '500',
  },
  progressLine: {
    position: 'absolute',
    top: '28px',
    left: '140px',
    right: '140px',
    height: '2px',
    backgroundColor: '#e0e0e0',
    zIndex: 0,
  },
  text: {
    color: '#6c5ce7',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    border: 'none',
    borderRadius: '4px',
  },
  button: {
    backgroundColor: 'white',
    border: '1.5px solid #6c5ce7',
    color: '#6c5ce7',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '12px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  authButton: {
    backgroundColor: '#6c5ce7',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: '13px',
    marginTop: '30px',
    lineHeight: '1.5',
  },
  deviceSelector: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  deviceOption: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deviceOptionActive: {
    borderColor: '#6c5ce7',
    backgroundColor: '#f5f3ff',
  },
  deviceIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f3ff',
    borderRadius: '50%',
    color: '#6c5ce7',
  }
};

const BiometricAuth = () => {
  const [device, setDevice] = useState('Mantra');
  const [mobile, setMobile] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);
  const [fingerprintCaptured, setFingerprintCaptured] = useState(false);
  const [biometricData, setBiometricData] = useState(null);
  const redirect = useNavigate();
  const isFirstRender = useRef(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [otpReferenceData, setOtpReferenceData] = useState(null);


  const checkstatus = async () => {
    // Check the status of the registration
    const apiService = ApiService();
    const response = await apiService.vPost('/check2FAAuth');
    if (response.data.status === true) {

      if (response.data.mode === 1) {
        setAadharNo(response.data.aadharNo || '');
        setShowOtpModal(true);
      }
      if (response.data.mode === 2) {
        setAadhaar(response.data.aadharNo || '');
        setMobile(response.data.phone || null);
        redirect('/aeps/2fa');
      }
      if (response.data.mode === 3) {
        redirect('/aeps');
      }
      //notify.success('check2FAAuth successfully');
    } else {
      notify.error('check2FAAuth failed');
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      checkstatus();
    }
  }, []);


  const handleOtpVerification = async () => {
    if (!otp) {
      notify.error('Please enter OTP');
      return;
    }

    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/otpValidate', {
        aadharNo: aadharNo,
        otp: otp
      });


      if (response.data.status === true) {
        notify.success('OTP verified successfully');

        // Store the new outlet ID from the response
        const { token, merchantData } = retrieveTokenAndUserData() || {};
        const { mid, mkey, outletId } = merchantData || {};

        if (response.data.outletId) {
          storeTokenAndUserData({
            mid: mid,
            mkey: mkey,
            outletId: response.data.outletId || outletId || "",
            token: token
          });
        }

        setShowOtpModal(false);
        redirect('/aeps'); // Redirect to AEPS page after successful OTP verification

      } else {
        notify.error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      notify.error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  const handleModalClose = () => {
    setShowOtpModal(false);
    setOtp('');
  };

  const checkDeviceService = () => {
    // Check if service is running
    switch (device) {
      case 'Mantra':
        return 'Mantra RD Service';
      case 'Morpho':
        return 'Morpho RD Service';
      case 'Startek':
        return 'Startek RD Service';
      case 'SecuGen':
        return 'SecuGen RD Service';
      case 'Precision':
        return 'Precision RD Service';
      case 'Evolution':
        return 'Evolution RD Service';
      default:
        return 'RD Service';
    }
  };

  const handleCapture = async () => {
    try {
      setLoading(true);
      const serviceName = checkDeviceService();

      // Discover the device
      const discoveryData = await discoverBiometricDevice(device.toLowerCase());
      if (!discoveryData.methodUrl) {
        throw new Error(`${serviceName} not found. Please check if the service is installed and running.`);
      }

      // Capture fingerprint
      const captureData = await captureFingerprint(discoveryData.methodUrl, true);
      if (!captureData.success) {
        throw new Error(captureData.error || 'Failed to capture fingerprint');
      }

      // Parse the incoming XML using fast-xml-parser
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text"
      });
      const parsedData = parser.parse(captureData.data);

      const biometricStructuredData = {
        errCode: parseInt(parsedData?.PidData?.Resp?.["@_errCode"]) || "",
        errInfo: (parsedData?.PidData?.Resp?.["@_errInfo"]) || "",
        fCount: parseInt(parsedData?.PidData?.Resp?.["@_fCount"]) || "",
        fType: parseInt(parsedData?.PidData?.Resp?.["@_fType"]) || "",
        iCount: 0,
        iType: null,
        pCount: 0,
        pType: 0,
        nmPoints: parseInt(parsedData?.PidData?.Resp?.["@_nmPoints"]) || "",
        qScore: parseInt(parsedData?.PidData?.Resp?.["@_qScore"]) || "",
        dpID: (parsedData?.PidData?.DeviceInfo?.["@_dpId"]) || "",
        rdsID: (parsedData?.PidData?.DeviceInfo?.["@_rdsId"]) || "",
        rdsVer: (parsedData?.PidData?.DeviceInfo?.["@_rdsVer"]) || "",
        dc: (parsedData?.PidData?.DeviceInfo?.["@_dc"]) || "",
        mi: (parsedData?.PidData?.DeviceInfo?.["@_mi"]) || "",
        mc: (parsedData?.PidData?.DeviceInfo?.["@_mc"]) || "",
        ci: (parsedData?.PidData?.Skey?.["@_ci"]) || "",
        sessionKey: (parsedData?.PidData?.Skey?.["#text"]) || "",
        hmac: (parsedData?.PidData?.Hmac?.["#text"] || parsedData?.PidData?.Hmac) || "",
        PidDatatype: (parsedData?.PidData?.Data?.["@_type"]) || "",
        Piddata: (parsedData?.PidData?.Data?.["#text"]) || ""
      }

      

      // Call the API with structured biometric data
      const apiService = ApiService();
      const response = await apiService.vPost('/twoFactorAuthenticate', {
        biometricData: captureData.data,
      });

      if (response.data.status === true) {
        notify.success('Biometric authentication successful');
        redirect('/aeps');
      } else {

        if (response.data.mode === 3) {
          redirect('/aeps');
        }
        notify.error(response.data.message || 'Biometric authentication failed');
      }

    } catch (error) {
      const errorMessage = error.message.includes('Failed to fetch')
        ? `${checkDeviceService()} is not running. Please ensure:\n1. The service is installed\n2. Service is running in system tray\n3. Try restarting the service`
        : error.message;
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="container-xxl">
        <div className="row">
          <div className="col-md-12">
            <div className="card" style={styles.container}>
              <div className='card-header' style={styles.header}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div style={styles.shield}>🛡️</div>
                    <div>
                      <h5 className="mb-0">TWO-FACTOR AUTHENTICATION</h5>
                      <small className="text-muted">Secured by NPCI Guidelines</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span style={styles.badge}>NPCI Compliant</span>
                    <img
                      src={npciLogo}
                      alt="NPCI Logo"
                      style={{ height: '40px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              </div>

              <div className='card-body'>
                <div style={styles.progressBar}>
                  <div style={styles.progress}></div>
                </div>

                <div style={styles.icons}>
                  <div style={styles.progressLine}></div>
                  <div style={styles.iconContainer}>
                    <div style={styles.iconCircle}>
                      <span role="img" aria-label="fingerprint">👆</span>
                    </div>
                    <div style={styles.iconText}>Capture</div>
                  </div>
                  <div style={styles.iconContainer}>
                    <div style={styles.iconCircleInactive}>
                      <span role="img" aria-label="verify">✓</span>
                    </div>
                    <div style={styles.iconTextInactive}>Verify</div>
                  </div>
                </div>

                <p style={styles.text}>
                  Please verify your identity using your biometric device as per NPCI guidelines for AePS transactions.
                </p>


                <div className="row">
                  <div className="col-md-6">
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Mobile Number</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#666',
                          fontSize: '15px'
                        }}>+91</span>
                        <input
                          style={{
                            ...styles.input,
                            paddingLeft: '54px'
                          }}
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Aadhaar Number</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value)}
                        placeholder="XXXXXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Biometric Device</label>

                  <div className="row">
                    <div className="col-md-2">
                      <div
                        style={{
                          ...styles.deviceOption,
                          ...(device === 'Mantra' && styles.deviceOptionActive),
                          width: '100%'
                        }}
                        onClick={() => setDevice('Mantra')}
                      >
                        <span style={styles.deviceIcon}>
                          <i className="bi bi-fingerprint"></i>
                        </span>
                        <div>
                          <div style={{ fontWeight: 500 }}>Mantra</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                        </div>
                        <input
                          type="radio"
                          name="device"
                          value="Mantra"
                          checked={device === 'Mantra'}
                          onChange={() => { }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div
                        style={{
                          ...styles.deviceOption,
                          ...(device === 'Morpho' && styles.deviceOptionActive),
                          width: '100%'
                        }}
                        onClick={() => setDevice('Morpho')}
                      >
                        <span style={styles.deviceIcon}>
                          <i className="bi bi-fingerprint"></i>
                        </span>
                        <div>
                          <div style={{ fontWeight: 500 }}>Morpho</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                        </div>
                        <input
                          type="radio"
                          name="device"
                          value="Morpho"
                          checked={device === 'Morpho'}
                          onChange={() => { }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div
                        style={{
                          ...styles.deviceOption,
                          ...(device === 'Startek' && styles.deviceOptionActive),
                          width: '100%'
                        }}
                        onClick={() => setDevice('Startek')}
                      >
                        <span style={styles.deviceIcon}>
                          <i className="bi bi-fingerprint"></i>
                        </span>
                        <div>
                          <div style={{ fontWeight: 500 }}>Startek</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                        </div>
                        <input
                          type="radio"
                          name="device"
                          value="Startek"
                          checked={device === 'Startek'}
                          onChange={() => { }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div
                        style={{
                          ...styles.deviceOption,
                          ...(device === 'SecuGen' && styles.deviceOptionActive),
                          width: '100%'
                        }}
                        onClick={() => setDevice('SecuGen')}
                      >
                        <span style={styles.deviceIcon}>
                          <i className="bi bi-fingerprint"></i>
                        </span>
                        <div>
                          <div style={{ fontWeight: 500 }}>SecuGen</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                        </div>
                        <input
                          type="radio"
                          name="device"
                          value="SecuGen"
                          checked={device === 'SecuGen'}
                          onChange={() => { }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div
                        style={{
                          ...styles.deviceOption,
                          ...(device === 'Precision' && styles.deviceOptionActive),
                          width: '100%'
                        }}
                        onClick={() => setDevice('Precision')}
                      >
                        <span style={styles.deviceIcon}>
                          <i className="bi bi-fingerprint"></i>
                        </span>
                        <div>
                          <div style={{ fontWeight: 500 }}>Precision</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                        </div>
                        <input
                          type="radio"
                          name="device"
                          value="Precision"
                          checked={device === 'Precision'}
                          onChange={() => { }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div
                        style={{
                          ...styles.deviceOption,
                          ...(device === 'Evolution' && styles.deviceOptionActive),
                          width: '100%'
                        }}
                        onClick={() => setDevice('Evolution')}
                      >
                        <span style={styles.deviceIcon}>
                          <i className="bi bi-fingerprint"></i>
                        </span>
                        <div>
                          <div style={{ fontWeight: 500 }}>Evolution</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                        </div>
                        <input
                          type="radio"
                          name="device"
                          value="Evolution"
                          checked={device === 'Evolution'}
                          onChange={() => { }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>


                <div style={{ marginTop: '32px', alignContent: 'center' }}>
                  <center>
                    <button
                      style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                      onClick={handleCapture}
                      disabled={loading}
                    >
                      <span role="img" aria-label="fingerprint" style={{ marginRight: '10px', fontSize: '18px' }}>👆</span>
                      {loading ? 'Capturing...' : 'Capture Fingerprint'}
                    </button>
                  </center>
                </div>

                <p style={styles.footer}>
                  Your biometric data is secure and encrypted. It is only used for authentication purposes as per NPCI guidelines.
                </p>
              </div>


              {/* OTP Verification Modal */}
              <div className={`modal fade ${showOtpModal ? 'show' : ''}`}
                style={{ display: showOtpModal ? 'block' : 'none' }}
                tabIndex="-1"
                aria-labelledby="otpModalLabel"
                aria-hidden={!showOtpModal}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="otpModalLabel">OTP Verification</h5>
                      <button type="button"
                        className="btn-close"
                        onClick={handleModalClose}
                        aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label htmlFor="otp" className="form-label">Enter OTP</label>
                        <input type="text"
                          className="form-control"
                          id="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP sent to your mobile" />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button"
                        className="btn btn-secondary"
                        onClick={handleModalClose}>Close</button>
                      <button type="button"
                        className="btn btn-primary"
                        onClick={handleOtpVerification}>Verify OTP</button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Modal Backdrop */}
              {showOtpModal && <div className="modal-backdrop fade show"></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricAuth;