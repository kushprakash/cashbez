import { useEffect, useState, useRef, useContext } from "react";
import { discoverBiometricDevice, captureFingerprint } from './mantra_morpho/BiometricScannerComponent';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../core/hooks/context';
import npciLogo from './npci-logo.png';

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
  progressFill: {
    height: '100%',
    backgroundColor: '#6c5ce7',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  deviceCard: {
    backgroundColor: '#f8f9fa',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    margin: '20px 0',
  },
  deviceCardActive: {
    backgroundColor: '#e7f1ff',
    borderColor: '#3b82f6',
  },
  scanButton: {
    backgroundColor: '#6c5ce7',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  scanButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },
  fingerIcon: {
    fontSize: '48px',
    color: '#6c5ce7',
    marginBottom: '15px',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  step: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9ecef',
    color: '#6c757d',
    fontSize: '14px',
    fontWeight: '600',
  },
  stepActive: {
    backgroundColor: '#6c5ce7',
    color: 'white',
  },
  stepCompleted: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  stepLine: {
    width: '40px',
    height: '2px',
    backgroundColor: '#e9ecef',
  },
  stepLineActive: {
    backgroundColor: '#6c5ce7',
  }
};

const CashDepositBiometricKyc = () => {
  const navigate = useNavigate();
  const { userData: user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('discovering');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [biometricData, setBiometricData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState('pending');

  const steps = [
    { id: 1, label: 'Device', desc: 'Discover Device' },
    { id: 2, label: 'Scan', desc: 'Capture Biometric' },
    { id: 3, label: 'Verify', desc: 'Submit KYC' },
    { id: 4, label: 'Complete', desc: 'Verification Done' }
  ];

  useEffect(() => {
    initializeBiometricDevice();
  }, []);

  const initializeBiometricDevice = async () => {
    setLoading(true);
    try {
      setDeviceStatus('discovering');
      const deviceData = await discoverBiometricDevice();
      
      if (deviceData && deviceData.DeviceInfo) {
        setDeviceInfo(deviceData.DeviceInfo);
        setDeviceStatus('ready');
        setCurrentStep(2);
        toast.success('Biometric device discovered successfully');
      } else {
        setDeviceStatus('error');
        toast.error('No biometric device found. Please connect a device and try again.');
      }
    } catch (error) {
      console.error('Device discovery error:', error);
      setDeviceStatus('error');
      toast.error('Failed to discover biometric device');
    } finally {
      setLoading(false);
    }
  };

  const captureBiometricData = async () => {
    setLoading(true);
    setCurrentStep(2);
    
    try {
      const fingerprint = await captureFingerprint();
      
      if (fingerprint.ErrorCode === 0) {
        setBiometricData(fingerprint.BioMetricResponse);
        setCurrentStep(3);
        toast.success('Biometric captured successfully');
        await submitBiometricKyc(fingerprint.BioMetricResponse);
      } else {
        toast.error(`Biometric capture failed: ${fingerprint.ErrorDescription}`);
      }
    } catch (error) {
      console.error('Biometric capture error:', error);
      toast.error('Failed to capture biometric data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitBiometricKyc = async (biometricXml) => {
    setLoading(true);
    
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/submit-biometric-kyc', {
        biometric_data: biometricXml,
        device_info: deviceInfo,
        outletId: user.mid
      });

      if (response.data.status === 1) {
        setCurrentStep(4);
        setKycStatus('completed');
        toast.success('Biometric KYC completed successfully!');
        
        setTimeout(() => {
          navigate('/banking/cash-deposit/two-factor-auth');
        }, 2000);
      } else {
        toast.error(response.data.message || 'Biometric KYC submission failed');
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Biometric KYC submission error:', error);
      toast.error('Failed to submit biometric KYC');
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const retryDeviceDiscovery = () => {
    setDeviceStatus('discovering');
    setCurrentStep(1);
    setBiometricData(null);
    initializeBiometricDevice();
  };

  const goBack = () => {
    navigate('/banking/cash-deposit/ekyc');
  };

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const renderStepIndicator = () => {
    return (
      <div style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <div key={step.id} className="d-flex align-items-center">
            <div style={{
              ...styles.step,
              ...(getStepStatus(step.id) === 'active' ? styles.stepActive : {}),
              ...(getStepStatus(step.id) === 'completed' ? styles.stepCompleted : {})
            }}>
              {getStepStatus(step.id) === 'completed' ? (
                <i className="fas fa-check"></i>
              ) : (
                step.id
              )}
            </div>
            {index < steps.length - 1 && (
              <div style={{
                ...styles.stepLine,
                ...(getStepStatus(step.id) === 'completed' ? styles.stepLineActive : {})
              }}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDeviceStatus = () => {
    switch (deviceStatus) {
      case 'discovering':
        return (
          <div style={styles.deviceCard}>
            <i className="fas fa-search fa-3x text-primary mb-3"></i>
            <h5>Discovering Biometric Device...</h5>
            <p className="text-muted">Please wait while we search for connected biometric devices.</p>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div style={{ ...styles.deviceCard, ...styles.deviceCardActive }}>
            <i className="fas fa-fingerprint" style={styles.fingerIcon}></i>
            <h5 className="text-success">Device Ready</h5>
            <p className="text-muted mb-3">
              {deviceInfo ? `${deviceInfo.Make} ${deviceInfo.Model}` : 'Biometric device detected'}
            </p>
            <button
              onClick={captureBiometricData}
              disabled={loading}
              style={{
                ...styles.scanButton,
                ...(loading ? styles.scanButtonDisabled : {})
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Capturing...
                </>
              ) : (
                <>
                  <i className="fas fa-hand-paper me-2"></i>
                  Place Finger & Scan
                </>
              )}
            </button>
          </div>
        );

      case 'error':
        return (
          <div style={styles.deviceCard}>
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h5 className="text-danger">Device Not Found</h5>
            <p className="text-muted mb-3">
              Please ensure your biometric device is connected and try again.
            </p>
            <button
              onClick={retryDeviceDiscovery}
              className="btn btn-outline-primary"
            >
              <i className="fas fa-sync-alt me-2"></i>
              Retry Discovery
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {/* Header */}
          <div className="d-flex align-items-center mb-4" style={styles.header}>
            <div style={styles.shield}>
              <i className="fas fa-shield-alt" style={{ color: '#6c5ce7' }}></i>
            </div>
            <div style={styles.headerText}>
              <h4 className="m-0">Biometric KYC Verification</h4>
              <p className="m-0 text-muted">Complete biometric verification for Cash Deposit service</p>
            </div>
            <div style={styles.badge}>
              <img src={npciLogo} alt="NPCI" style={{ height: '20px', marginRight: '8px' }} />
              Secure
            </div>
          </div>

          <div style={styles.container} className="p-4">
            {/* Progress Bar */}
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${(currentStep / steps.length) * 100}%`
                }}
              ></div>
            </div>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Current Step Description */}
            <div className="text-center mb-4">
              <h5>{steps[currentStep - 1]?.desc}</h5>
              <p className="text-muted">
                {currentStep === 1 && "We're searching for your biometric device..."}
                {currentStep === 2 && "Place your finger on the biometric scanner"}
                {currentStep === 3 && "Submitting your biometric data for verification"}
                {currentStep === 4 && "Biometric KYC verification completed successfully!"}
              </p>
            </div>

            {/* Device Status */}
            {renderDeviceStatus()}

            {/* Biometric Data Status */}
            {biometricData && (
              <div className="alert alert-success mt-3">
                <i className="fas fa-check-circle me-2"></i>
                <strong>Biometric Captured:</strong> Your fingerprint has been captured successfully.
              </div>
            )}

            {/* KYC Completion Status */}
            {kycStatus === 'completed' && (
              <div className="alert alert-success mt-3">
                <i className="fas fa-trophy me-2"></i>
                <strong>KYC Completed:</strong> Your biometric verification is complete. 
                Redirecting to two-factor authentication...
              </div>
            )}

            {/* Instructions */}
            <div className="alert alert-info mt-3">
              <h6><i className="fas fa-info-circle me-2"></i>Instructions:</h6>
              <ul className="mb-0">
                <li>Ensure your biometric device is properly connected</li>
                <li>Clean your finger before placing it on the scanner</li>
                <li>Keep your finger steady during scanning</li>
                <li>Multiple attempts may be required for best results</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={goBack}
                disabled={loading}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to eKYC
              </button>

              {deviceStatus === 'error' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={retryDeviceDiscovery}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  Retry Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default CashDepositBiometricKyc;