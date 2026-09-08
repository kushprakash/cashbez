import React, { useState, useRef, useContext, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import userPhoto from '../../../public/assets/images/users/avatar-1.jpg';
import { apiUrl } from '../core/config';
import { useLocation } from 'react-router-dom';
import ribon from '././ribon.png';
import digiIndia from './digital-india.png';
import startupindia from './startup-india.webp';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Certificate = (params) => {

  const context = useContext(AuthContext);
  const { userData: user, logout } = context || {};
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const lastPath = pathSegments[pathSegments.length - 1];
  const userMid = (!context || !user) ? atob(lastPath) : user?.mid;
  const fileInputRef = useRef(null);
  const certificateRef = useRef(null);

  const [state, setState] = useState({
    photoPreview: user?.photo || userPhoto,
    qrCodeDataUrl: '',
    adminData: null,
    employeeData: {
      name: '',
      designation: user?.role_name || '',
      code: userMid || '',
      team: 'Bussiness Team',
      address: '',
      phone: '',
      email: '',
      photo: ''
    },
    color1: 'rgba(0, 165, 206, 0.85)',
    color2: 'rgba(60, 87, 114, 0.84)',
    isLoading: true,
    loadingMessage: 'Fetching certificate data...'
  });


  useEffect(() => {
    // Return early if no context or no user data
    if (userMid) {
      fetchUserData(userMid);
    }
  }, [userMid]);


  const hostname = window.location.hostname;

  // Extract main domain (remove subdomain)
  const domainParts = hostname.split('.');
  let mainDomain = hostname;
  if (domainParts.length > 2) {
    // Get last two parts (e.g., domain.com)
    mainDomain = domainParts.slice(-2).join('.');
  }

  // Remove "www." if present and format domain text
  const cleanDomain = mainDomain.replace(/^www\./, '').toUpperCase();
  const websiteDomain = 'WWW.' + cleanDomain;

  const baseUrl = window.location.origin;

  const qrCodeUrl =
    apiUrl +
    '/api/qr-generate-v27?text=' +
    encodeURIComponent(baseUrl + '/certificate/' + btoa(state.employeeData.code));

  // Fetch admin data
  const fetchUserData = async (mid) => {
    try {
      setState(prevState => ({
        ...prevState,
        isLoading: true,
        loadingMessage: 'Fetching certificate data...'
      }));

      const AdminData = apiUrl + '/api/getUserData/' + mid;
      const response = await fetch(AdminData);
      const data = await response.json();
      const adminData1 = data.user;

      setState(prevState => ({
        ...prevState,
        loadingMessage: 'Validating information...'
      }));

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prevState => ({
        ...prevState,
        adminData: adminData1,
        employeeData: {
          name: adminData1?.name || '',
          designation: adminData1?.role_name || '',
          code: adminData1?.mid || userMid || '',
          team: 'Bussiness Team',
          address: adminData1?.address || '',
          phone: adminData1?.mobile || '',
          email: adminData1?.email || '',
          photo: adminData1?.photo || ''
        },
        photoPreview: adminData1?.photo || '',
        color1: adminData1?.color1 ? hexToRgba(adminData1.color1, 0.75) : 'rgba(0, 165, 206, 0.85)',
        color2: adminData1?.color2 ? hexToRgba(adminData1.color2, 0.64) : 'rgba(60, 87, 114, 0.84)',
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        loadingMessage: 'Error loading certificate data'
      }));
    }
  };


  // Set QR code URL directly without fetching
  useEffect(() => {
    if (state.employeeData?.code) {
      const cacheBuster = new Date().getTime();
      setState(prevState => ({
        ...prevState,
        qrCodeDataUrl: `${qrCodeUrl}&_=${cacheBuster}`
      }));
    }
  }, [state.adminData, state.employeeData?.code]);

  // Generate unique certificate hash for verification
  const generateCertHash = (mid, name, date) => {
    const str = `${mid}-${name}-${date}-${baseUrl}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(12, '0');
  };

  const certHash = generateCertHash(
    state.employeeData.code,
    state.employeeData.name,
    state.adminData?.join || new Date().toISOString()
  );

  const certSerialNumber = `BC-${new Date().getFullYear()}-${state.employeeData.code}-${certHash.substring(0, 6)}`;
  const verificationUrl = `${baseUrl}/verify/${certHash}`;
  const issuedTimestamp = new Date().toISOString();

  // Download as PNG
  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `Certificate_${state.employeeData.name}_${state.employeeData.code}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading PNG:', error);
      alert('Failed to download PNG. Please try again.');
    }
  };

  // Download as PDF
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${state.employeeData.name}_${state.employeeData.code}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };



  return (
    <>
      {state.isLoading ? (
        <div className="loader-container">
          <div className="loader-content">
            <div className="spinner-wrapper">
              <div className="spinner"></div>
              <div className="spinner-inner"></div>
            </div>
            <h3 className="loader-title">{state.loadingMessage}</h3>
            <p className="loader-subtitle">Please wait while we prepare your certificate</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hidden metadata for verification */}
          {/*
            CERTIFICATE_METADATA:
            Hash: {certHash}
            Serial: {certSerialNumber}
            Issued: {issuedTimestamp}
            MID: {state.employeeData.code}
            Domain: {baseUrl}
            Signature: SHA256-{certHash}
          */}
          <div className="page-content-box">
            <div className="page-content-box-inner">
              {/* Download Buttons */}
              <div className="download-buttons-container">
                <button onClick={handleDownloadPDF} className="download-btn download-btn-pdf">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download PDF</span>
                </button>
                <button onClick={handleDownloadPNG} className="download-btn download-btn-png">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download PNG</span>
                </button>
              </div>

              <div className="certificate-container">
                <div className="certificate-wrapper" ref={certificateRef}>
                  {/* Decorative Border */}
                  <div className="certificate-border">

                    {/* Watermark */}
                    <img src={state.adminData?.favicon} className='watermark' />

                    {/* Hidden verification code (invisible layer) */}
                    {/* <div className="hidden-verification-code" aria-hidden="true">
                  CERT-HASH-{certHash}-VERIFY-{state.employeeData.code}
                </div> */}

                    {/* Header Section */}
                    <div className="certificate-header">
                      <div className="header-left">
                        <img src={state.adminData?.logo} alt="Company Logo" className="Company-logo" />
                      </div>
                      <div className="header-center">
                        <img src={ribon} />
                      </div>
                      <div className="header-right">

                        <img src={digiIndia} height={60} width={"auto"} />
                        <div className="bc-id">MID: <em>{state.employeeData.code || '00000000'}</em></div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="certificate-title">
                      BUSINESS CORRESPONDENT CERTIFICATE
                    </div>

                    {/* Certificate Content */}
                    <div className="certificate-content">
                      <div className="certificate-text">
                        <p className="text-line">
                          This is to certify that <span className="recipient-name fit"> {state.employeeData.name || 'Mr. User'} </span>
                        </p>
                        <p className="text-line">
                          Address: <span className="address-text fit">{state.employeeData.address || 'India'}</span>
                        </p>
                        <p className="text-line authorization">
                          is an authorized Business Correspondent of {state.adminData?.cname || 'Private Limited'}.
                        </p>
                      </div>

                      {/* Signatures */}
                      <div className="signatures-section">
                        <div className="signature-left">
                          <div className="active-from">
                            <div>Joined From</div>
                            <div>Date: <span className="date-value"> {state.adminData?.join || ''}</span></div>
                          </div>
                        </div>
                        <div className="signature-center">
                          {state.qrCodeDataUrl ? (
                            <img src={state.qrCodeDataUrl} alt="QR Code" width="165" height="165" />
                          ) : (
                            <div style={{ width: '145px', height: '145px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                              Loading...
                            </div>
                          )}
                        </div>
                        <div className="signature-right">
                          <div className="signature-line">
                            <img src={state.adminData?.sign || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'%3E%3Cpath d='M10 25 Q30 15, 52 28 T90 22 T110 30' stroke='%23000' stroke-width='2' fill='none'/%3E%3C/svg%3E"} alt="Signature" className="signature-img" />
                          </div>
                          <div className="signature-name">{state.adminData?.cname || 'Private Limited'}</div>
                          <div className="signature-title">CEO / Director</div>
                        </div>
                      </div>
                    </div>

                    {/* Microtext Footer - Anti-Forgery */}
                    <div className="microtext-footer">
                      <div className="microtext-line">
                        SERIAL: {certSerialNumber} | HASH: {certHash} | VERIFY: {verificationUrl}
                      </div>
                      <div className="microtext-line">
                        {state.adminData?.cname || 'Private Limited'} • Business Correspondent Certification • Valid Document • {new Date().getFullYear()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        /* Loader Styles - Premium & Compact */
        .loader-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .loader-content {
          text-align: center;
          padding: 35px 45px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
          max-width: 320px;
          width: 90%;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .spinner-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
          margin: 0 auto 24px;
        }

        .spinner {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(59, 130, 246, 0.1);
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .spinner-inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border: 2px solid transparent;
          border-bottom: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loader-title {
          font-size: 15px;
          font-weight: 500;
          color: #1f2937;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
        }

        .loader-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 20px 0;
          font-weight: 400;
        }

        .progress-bar {
          width: 100%;
          height: 2px;
          background: #f3f4f6;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          animation: progress 1.5s ease-in-out infinite;
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 65%;
          }
          100% {
            width: 100%;
          }
        }

        .certificate-container {
          margin: 20px auto;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          background: #f5f5f5;
        }

        .certificate-wrapper {
          width: 1000px;
          background: white;
          position: relative;
        }

        .certificate-border {
          border: 15px solid;
          border-image: repeating-linear-gradient(
            0deg,
            ${state?.color1 || '#c62828'} 0px,
            ${state?.color2 || '#8b1a1a'} 5px,
            ${state?.color1 || '#8b1a1a'} 5px,
            ${state?.color2 || '#8b1a1a'} 10px
          ) 15;
          padding: 20px 25px;
          position: relative;
          background: ${hexToRgba(state?.adminData?.color1, 0.1)};
          box-shadow: 0 0 0 5px ${state?.color1 || '#c62828'};
        }

        .certificate-border::before {
          content: '';
          position: absolute;
          top: -20px;
          left: -20px;
          right: -20px;
          bottom: -20px;
          background: repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 8px,
            #c62828 8px,
            #c62828 10px
          );
          z-index: -1;
          pointer-events: none;
        }

        .certificate-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          min-height: 165px;
          position: relative;
        }

        .header-left {
          flex: 0 0 auto;
        }

        .Company-logo {
          height: 60px;
          width: auto;
        }

        .header-center {
          position: absolute;
          left: 50%;
          top: 5px;
          transform: translateX(-50%);
        }

        .header-center img {
        width: auto;
    height: 200px;
        }

        
        .header-right {
          flex: 0 0 auto;
        }

        .bc-id {
          font-size: 16px;
          font-weight: 400;
          color: #333;
        }

        .bc-id em {
          font-style: italic;
          color: #666;
        }

        .certificate-title {
          text-align: center;
          font-size: 22px;
          font-weight: 700;
          color: ${state?.adminData?.color1};
          margin: 50px 0 22px 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .certificate-content {
          position: relative;
          margin-top: 22px;
        }

        .certificate-text {
          text-align: center;
          line-height: 2.2;
        }

        .text-line {
          font-size: 18px;
          color: #333;
          margin: 6px 0;
        }

        .fit{
        font-style: italic;
        font-family: cursive;
        }

        .recipient-name {
          font-weight: 400;
          color: #000;
        }

        .address-text {
          color: #333;
        }

        .authorization {
          font-weight: 400;
        }

        .signatures-section {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 22px;
          margin-top: 22px;
          align-items: center;
        }

        .signature-left {
          text-align: center;
        }

        .signature-center,
        .signature-right {
          text-align: center;
        }

        .active-from {
          font-size: 16px;
          color: #333;
          line-height: 1.8;
        }

        .date-value {
        }

        .signature-line {
          height: 50px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signature-img {
          width: 120px;
          height: 40px;
        }

        .signature-name {
          font-size: 16px;
          font-weight: 600;
          color: #000;
          margin-bottom: 5px;
        }

        .signature-title {
          font-size: 14px;
          color: #333;
          margin-bottom: 3px;
        }

        .signature-region {
          font-size: 14px;
          color: #333;
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 350px;
          font-weight: 900;
          opacity: 0.25;
          z-index: 0;
          pointer-events: none;
          font-family: Arial, sans-serif;
        }

     
        /* Microtext Footer */
        .microtext-footer {
          margin-top: 6px;
          padding-top: 5px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .microtext-line {
          font-size: 7px;
          line-height: 1.4;
          color: rgba(0, 0, 0, 0.4);
          font-family: 'Courier New', monospace;
          letter-spacing: 0.3px;
          margin: 2px 0;
          word-break: break-all;
        }

        @media print {
          body {
            background-color: white;
          }

          .wrapper .page-content {
            padding: 0;
          }

          .page-content-box,
          .certificate-container,
          .page-content-box-inner {
            margin: 0;
            padding: 0;
            box-shadow: none;
          }

          .page-header-breadcrumb {
            display: none !important;
          }

          .certificate-container {
            padding: 0;
            background: white;
          }

          .certificate-wrapper {
            width: 100%;
            page-break-inside: avoid;
          }

          /* Print-only watermark - different from screen */
          .watermark {
            opacity: 0.15 !important;
            width: 400px !important;
            filter: grayscale(100%);
          }

          /* Enhance microtext visibility on print */
          .microtext-footer {
            border-top: 2px solid rgba(0, 0, 0, 0.2);
          }

          .microtext-line {
            font-size: 6px;
            color: rgba(0, 0, 0, 0.5);
            font-weight: 500;
          }

          /* Add print-only security message */
          .certificate-border::after {
            content: 'PRINTED COPY - VERIFY AUTHENTICITY AT ${verificationUrl}';
            position: absolute;
            bottom: -25px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: rgba(0, 0, 0, 0.3);
            font-family: monospace;
          }


          /* Security pattern more visible on print */
          .security-pattern {
            opacity: 0.6 !important;
          }
        }

        @media screen and (max-width: 1100px) {
          .certificate-wrapper {
            width: 100%;
            // max-width: 1000px;
          }

          .certificate-border {
            padding: 10px 10px;
          }

          .certificate-title {
            font-size: 22px;
          }

          .text-line {
            font-size: 18px;
          }

          .signatures-section {
            gap: 20px;
          }
        }

        @media screen and (max-width: 768px) {
          .certificate-border {
            padding: 20px 25px;
          }

          .certificate-title {
            font-size: 18px;
            margin: 35px 0 25px 0;
          }

          .text-line {
            font-size: 16px;
          }

          .signatures-section {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .signature-left {
            text-align: center;
          }

          .ribbon-badge {
            transform: scale(0.8);
          }
        }
      `}</style>
    </>
  );
};

const hexToRgba = (hex, opacity) => {
  if (hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else {
    return 'rgba(0,0,0, 0.1)';
  }
};

export default Certificate;



