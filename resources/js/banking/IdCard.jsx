import React, { useState, useRef, useContext, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import userPhoto from '../../../public/assets/images/users/avatar-1.jpg';
import { apiUrl } from '../core/config';
import { useLocation } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';

const IdCard = (params) => {
  const context = useContext(AuthContext);
  const { userData: user, logout } = context || {};
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const lastPath = pathSegments[pathSegments.length - 1];
  const userMid = (!context || !user) ? atob(lastPath) : user?.mid;
  const barcodeRef = useRef(null);

  const [state, setState] = useState({
    photoPreview: user?.photo || userPhoto,
    qrCodeDataUrl: '',
    adminData: null,
    employeeData: {
      name: '',
      designation: user?.role_name || '',
      code: userMid || '',
      team: 'Business Team',
      address: '',
      phone: '',
      email: '',
      photo: ''
    },
    color1: 'rgba(0, 165, 206, 0.85)',
    color2: 'rgba(60, 87, 114, 0.84)',
    isLoading: true,
    loadingMessage: 'Fetching ID card data...'
  });

  useEffect(() => {
    if (userMid) fetchUserData(userMid);
  }, [userMid]);

  // Render barcode once employee code is ready
  useEffect(() => {
    if (barcodeRef.current && state.employeeData.code) {
      try {
        JsBarcode(barcodeRef.current, state.employeeData.code, {
          format: 'CODE128',
          width: 1.5,
          height: 40,
          displayValue: true,
          fontOptions: 'bold',
          fontSize: 11,
          margin: 4,
          background: 'transparent',
          lineColor: '#0d2523'
        });
      } catch (e) {
        console.warn('JsBarcode error:', e);
      }
    }
  }, [state.employeeData.code, state.isLoading]);

  const downloadCard = async (cardId, filename) => {
    const card = document.getElementById(cardId);
    if (!card) return;
    try {
      const canvas = await html2canvas(card, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const hostname = window.location.hostname;
  const domainParts = hostname.split('.');
  let mainDomain = hostname;
  if (domainParts.length > 2) mainDomain = domainParts.slice(-2).join('.');
  const cleanDomain = mainDomain.replace(/^www\./, '').toUpperCase();
  const websiteDomain = 'WWW.' + cleanDomain;
  const baseUrl = window.location.origin;

  const qrCodeUrl =
    apiUrl +
    '/api/qr-generate-v27?text=' +
    encodeURIComponent(baseUrl + '/user/' + btoa(state.employeeData.code));

  const fetchUserData = async (mid) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Fetching ID card data...' }));
      const AdminData = apiUrl + '/api/getUserData/' + mid;
      const response = await fetch(AdminData);
      const data = await response.json();
      const adminData1 = data.user;

      setState(prev => ({ ...prev, loadingMessage: 'Validating information...' }));
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        adminData: adminData1,
        employeeData: {
          name: adminData1?.name || '',
          designation: adminData1?.role_name || '',
          code: adminData1?.mid || userMid || '',
          team: 'Business Team',
          address: adminData1?.address || '',
          phone: adminData1?.mobile || '',
          email: adminData1?.email || '',
          photo: adminData1?.photo || '',
          company_phone: adminData1?.company?.mobile_no || '',
          company_email: adminData1?.company?.email || '',
          company_address: adminData1?.company?.address || '',
        },
        photoPreview: adminData1?.photo || '',
        color1: adminData1?.color1 ? hexToRgba(adminData1.color1, 0.75) : '#1aada0',
        color2: adminData1?.color2 ? hexToRgba(adminData1.color2, 0.64) : '#0d8a80',
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setState(prev => ({ ...prev, isLoading: false, loadingMessage: 'Error loading ID card data' }));
    }
  };

  useEffect(() => {
    if (state.employeeData?.code) {
      const cacheBuster = new Date().getTime();
      setState(prev => ({ ...prev, qrCodeDataUrl: `${qrCodeUrl}&_=${cacheBuster}` }));
    }
  }, [state.adminData, state.employeeData?.code]);

  const logoSrc = state.adminData?.logo || 'https://cdn.enexaerp.com/settings/1769957400722_7c00t5.webp';

  return (
    <>
      {state.isLoading ? (
        <div className="cb-loader-wrap">
          <div className="cb-loader-box">
            <div className="cb-spinner-wrap">
              <div className="cb-spinner"></div>
              <div className="cb-spinner-inner"></div>
            </div>
            <h3 className="cb-loader-title">{state.loadingMessage}</h3>
            <p className="cb-loader-sub">Please wait while we prepare your ID card</p>
            <div className="cb-progress"><div className="cb-progress-fill"></div></div>
          </div>
        </div>
      ) : (
        <div className="cb-page-wrap">
          <div className="cb-cards-row">

            {/* ════════ FRONT CARD ════════ */}
            <div className="cb-card-slot">
              <div className="cb-side-tag">Front Side</div>

              <div className="cb-id-card" id="cb-card-front">
                {/* Shared graphic pattern */}
                <div className="cb-dot-grid"></div>
                <div className="cb-arc cb-arc1"></div>
                <div className="cb-arc cb-arc2"></div>
                <div className="cb-arc cb-arc3"></div>
                <div className="cb-ribbon-tr"></div>

                {/* Logo centred */}
                <div className="cb-cf-header">
                  <img src={logoSrc} alt="Logo" className="cb-cf-logo-img" />
                </div>

                <div className="cb-cf-rule"></div>

                {/* Photo + Name */}
                <div className="cb-cf-photo-section">
                  <div className="cb-cf-halo">
                    <div className="cb-cf-photo-ring">
                      <div className="cb-cf-photo-inner">
                        {state.photoPreview ? (
                          <img src={state.photoPreview} alt="Employee" className="cb-photo-img" />
                        ) : (
                          <svg viewBox="0 0 24 24" className="cb-photo-svg">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="cb-cf-name">{state.employeeData.name || 'Employee Name'}</div>
                  <div className="cb-cf-dept">{state.employeeData.designation || 'Designation'}</div>
                </div>

                <div className="cb-cf-rule2"></div>

                {/* Detail rows */}
                <div className="cb-cf-details">
                  <div className="cb-cf-detail-row">
                    <div className="cb-cf-det-icon">
                      <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 3h-2V5h2v2zm0 3h-2V8h2v2zm-4-3H5V5h2v2zm0 3H5V8h2v2zm13 7H4v-2h16v2zm0-4H4v-2h16v2z" /></svg>
                    </div>
                    <div className="cb-cf-det-body">
                      <div className="cb-cf-det-label">Employee ID</div>
                      <div className="cb-cf-det-value">{state.employeeData.code || '—'}</div>
                    </div>
                  </div>

                  <div className="cb-cf-detail-row">
                    <div className="cb-cf-det-icon">
                      <svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.4 11.4 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" /></svg>
                    </div>
                    <div className="cb-cf-det-body">
                      <div className="cb-cf-det-label">Phone</div>
                      <div className="cb-cf-det-value">+91 {state.employeeData.phone || '—'}</div>
                    </div>
                  </div>

                  <div className="cb-cf-detail-row">
                    <div className="cb-cf-det-icon">
                      <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
                    </div>
                    <div className="cb-cf-det-body">
                      <div className="cb-cf-det-label">Email</div>
                      <div className="cb-cf-det-value">{state.employeeData.email || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Barcode */}
                <div className="cb-barcode-wrap">
                  <svg ref={barcodeRef} id="cb-barcode-svg"></svg>
                </div>

                {/* Footer bar */}
                <div className="cb-cf-footer-bar">

                  <div className="cb-cf-footer-txt">{websiteDomain || 'WWW.CASHBEZ.COM'}</div>
                  <div className="cb-cf-footer-sep"></div>
                  <div className="cb-cf-footer-txt">+91 {state.employeeData.company_phone || '011-6926-6060'}</div>
                </div>
              </div>{/* /#cb-card-front */}
              <button
                className="cb-download-btn"
                onClick={() => downloadCard('cb-card-front', `${state.employeeData.name || 'idcard'}-front.png`)}
              >
                <svg viewBox="0 0 24 24" className="cb-dl-icon"><path d="M19 9h-4V3H9v6H5l7 7 7-7zm-14 9v2h14v-2H5z" /></svg>
                Download Front
              </button>
            </div>

            {/* ════════ BACK CARD ════════ */}
            <div className="cb-card-slot">
              <div className="cb-side-tag">Back Side</div>

              <div className="cb-id-card" id="cb-card-back">
                <div className="cb-dot-grid"></div>
                <div className="cb-arc cb-arc1"></div>
                <div className="cb-arc cb-arc2"></div>
                <div className="cb-arc cb-arc3"></div>
                <div className="cb-ribbon-tr"></div>
                <div className="cb-ribbon-bl"></div>

                {/* Logo + title */}
                <div className="cb-cf-header">
                  <img src={logoSrc} alt="Logo" className="cb-cf-logo-img" />
                </div>
                <div className="cb-cf-rule"></div>
                <div className="cb-back-header">
                  <div className="cb-back-title-row">
                    <div className="cb-btl"></div><div className="cb-btd"></div>
                    <div className="cb-back-title">Terms &amp; Conditions</div>
                    <div className="cb-btd"></div><div className="cb-btl"></div>
                  </div>
                </div>

                {/* Shield */}
                <div className="cb-shield">
                  <div className="cb-tc-item">
                    <div className="cb-tc-num">1</div>
                    <div className="cb-tc-text">
                      <strong>Identification:</strong> Employees are required to keep their ID badge visible or easily accessible during working hours to confirm identity when needed.
                    </div>
                  </div>
                  <div className="cb-tc-item">
                    <div className="cb-tc-num">2</div>
                    <div className="cb-tc-text">
                      <strong>Proper Use:</strong> The ID badge is issued solely for company-related activities. It may not be lent, duplicated, or used for any non-official purpose.
                    </div>
                  </div>
                  <div className="cb-tc-item">
                    <div className="cb-tc-num">3</div>
                    <div className="cb-tc-text">
                      <strong>Security:</strong> If the badge is misplaced or suspected to be compromised, report it immediately so access can be disabled.
                    </div>
                  </div>
                  <div className="cb-id-row">
                    <div className="cb-id-dash"></div>
                    <div className="cb-id-txt">ID No : {state.employeeData.code || '—'}</div>
                    <div className="cb-id-dash"></div>
                  </div>
                </div>

                {/* Back footer */}
                <div className="cb-back-footer">
                  <div className="cb-back-footer-rule"></div>
                  <div className="cb-back-footer-web">{websiteDomain || 'WWW.CASHBEZ.COM'}</div>
                  <div className="cb-back-footer-contact">+91 {state.employeeData.company_phone || '011-6926-6060'} &nbsp;·&nbsp; {state.employeeData.company_email || 'support@cashbez.com'}</div>
                  <div className="cb-back-footer-addr"><center>{state.employeeData.company_address || 'Muzaffarpur, Bihar – 842001'}</center></div>
                </div>
              </div>{/* /#cb-card-back */}
              <button
                className="cb-download-btn"
                onClick={() => downloadCard('cb-card-back', `${state.employeeData.name || 'idcard'}-back.png`)}
              >
                <svg viewBox="0 0 24 24" className="cb-dl-icon"><path d="M19 9h-4V3H9v6H5l7 7 7-7zm-14 9v2h14v-2H5z" /></svg>
                Download Back
              </button>
            </div>

          </div>{/* /.cb-cards-row */}
        </div>
      )}

      <style jsx>{`
        /* ── Loader ── */
        .cb-loader-wrap {
          position: fixed; inset: 0;
          background: rgba(255,255,255,.98);
          backdrop-filter: blur(10px);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999;
        }
        .cb-loader-box {
          text-align: center; padding: 35px 45px;
          background: #fff; border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,.06);
          max-width: 320px; width: 90%;
          border: 1px solid rgba(0,0,0,.04);
        }
        .cb-spinner-wrap { position: relative; width: 48px; height: 48px; margin: 0 auto 24px; }
        .cb-spinner {
          position: absolute; width: 100%; height: 100%;
          border: 2px solid rgba(26,173,160,.1); border-top-color: #1aada0;
          border-radius: 50%; animation: cbSpin .8s linear infinite;
        }
        .cb-spinner-inner {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 32px; height: 32px;
          border: 2px solid transparent; border-bottom-color: rgba(26,173,160,.4);
          border-radius: 50%; animation: cbSpin 1.2s linear infinite reverse;
        }
        @keyframes cbSpin { to { transform: rotate(360deg); } }
        .cb-loader-title { font-size: 15px; font-weight: 500; color: #1f2937; margin: 0 0 6px; }
        .cb-loader-sub   { font-size: 13px; color: #6b7280; margin: 0 0 20px; }
        .cb-progress { width: 100%; height: 2px; background: #f3f4f6; border-radius: 2px; overflow: hidden; }
        .cb-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1aada0, #25d9cc);
          animation: cbProg 1.5s ease-in-out infinite;
        }
        @keyframes cbProg { 0%{width:0%} 50%{width:65%} 100%{width:100%} }

        /* ── Page layout ── */
        .cb-page-wrap {
          display: flex; flex-direction: column; align-items: center;
          padding: 32px 16px 56px; gap: 0;
          font-family: 'Inter', sans-serif;
        }
        .cb-cards-row {
          display: flex; flex-wrap: wrap;
          gap: 40px; justify-content: center; align-items: flex-start;
        }
        .cb-card-slot { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .cb-side-tag {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 3.5px; color: #aac5c3; text-transform: uppercase;
        }

        /* ── Shared card shell – FIXED height so both sides match ── */
        .cb-id-card {
          position: relative;
          width: 340px;
          height: 540px;        /* fixed – both cards identical */
          border-radius: 22px; overflow: hidden;
          background: #fff; flex-shrink: 0;
          box-shadow:
            0 2px 4px rgba(0,0,0,.04),
            0 8px 24px rgba(0,0,0,.10),
            0 24px 56px rgba(0,0,0,.13),
            0 0 0 1px rgba(0,0,0,.06);
          display: flex; flex-direction: column;
          padding-bottom: 52px;
        }

        /* Ribbons */
        .cb-ribbon-tr {
          position: absolute; top: 0; right: 0; z-index: 2;
          width: 0; height: 0;
          border-left: 72px solid transparent;
          border-top: 72px solid #579A5E;
        }
        .cb-ribbon-tr::after {
          content: ''; position: absolute; top: -72px; right: 0;
          width: 0; height: 0;
          border-left: 52px solid transparent;
          border-top: 52px solid #3B8563;
        }
        .cb-ribbon-bl {
          position: absolute; bottom: 0; left: 0; z-index: 2;
          width: 0; height: 0;
          border-right: 60px solid transparent;
          border-bottom: 60px solid #579A5E;
        }
        .cb-ribbon-bl::after {
          content: ''; position: absolute; bottom: -60px; left: 0;
          width: 0; height: 0;
          border-right: 44px solid transparent;
          border-bottom: 44px solid #3B8563;
        }

        /* Dot grid */
        .cb-dot-grid {
          position: absolute; inset: 0; z-index: 1;
          background-image: radial-gradient(circle, rgba(26,173,160,.07) 1px, transparent 1px);
          background-size: 22px 22px; pointer-events: none;
        }

        /* Arcs */
        .cb-arc { position: absolute; border-radius: 50%; pointer-events: none; z-index: 1; }
        .cb-arc1 { top: -100px; right: -100px; width: 260px; height: 260px; border: 1px solid rgba(26,173,160,.1); }
        .cb-arc2 { top: -60px;  right: -60px;  width: 180px; height: 180px; border: 1px solid rgba(26,173,160,.07); }
        .cb-arc3 { bottom: -80px; left: -60px; width: 220px; height: 220px; border: 1px solid rgba(26,173,160,.07); }

        /* ── Front card elements ── */
        .cb-cf-header {
          position: relative; z-index: 3;
          display: flex; justify-content: center;
          padding: 24px 28px 0;
        }
        .cb-cf-logo-img {
          width: 140px; height: auto;
          object-fit: contain; display: block;
        }
        .cb-cf-rule, .cb-cf-rule2 {
          position: relative; z-index: 3;
          margin: 14px 28px 0; height: 1px;
          background: linear-gradient(90deg, transparent, #d5eeec, transparent);
        }

        /* Photo */
        .cb-cf-photo-section {
          position: relative; z-index: 3;
          display: flex; flex-direction: column; align-items: center;
          margin-top: 16px;
        }
        .cb-cf-halo {
          position: relative; width: 106px; height: 106px;
          display: flex; align-items: center; justify-content: center;
        }
        .cb-cf-halo::before {
          content: ''; position: absolute; inset: -8px; border-radius: 50%;
          border: 1.5px dashed rgba(26,173,160,.25);
          animation: cbHalo 18s linear infinite;
        }
        .cb-cf-halo::after {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          border: 1px solid rgba(26,173,160,.15);
        }
        @keyframes cbHalo { to { transform: rotate(360deg); } }

        .cb-cf-photo-ring {
          width: 102px; height: 102px; border-radius: 50%; padding: 3px;
          background: linear-gradient(135deg, #1aada0, #4dd9cc, #1aada0);
        }
        .cb-cf-photo-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: #e8faf8;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .cb-photo-img   { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .cb-photo-svg   { width: 56px; height: 56px; fill: #1aada0; opacity: .5; }

        .cb-cf-name {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 24px; font-weight: 700;
          color: #0d2523; text-align: center;
          letter-spacing: .3px; margin-top: 10px; line-height: 1;
        }
        .cb-cf-dept {
          font-size: 10px; font-weight: 500;
          color: #999; letter-spacing: 2.5px;
          text-transform: uppercase; margin-top: 5px;
        }

        /* Detail rows */
        .cb-cf-details {
          position: relative; z-index: 3;
          margin: 12px 22px 0;
          display: flex; flex-direction: column; gap: 6px;
        }
        .cb-cf-detail-row {
          display: flex; align-items: center; gap: 10px;
          padding: 5px 5px;
          background: #f4fffe;
          border: 1px solid #daf0ee;
          border-radius: 11px;
        }
        .cb-cf-det-icon {
          width: 28px; height: 28px; flex-shrink: 0;
          background: linear-gradient(135deg, #579A5E, #1aada0);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .cb-cf-det-icon svg { width: 14px; height: 14px; fill: #fff; }
        .cb-cf-det-body { flex: 1; display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
        .cb-cf-det-label {
          font-size: 8px; font-weight: 700;
          letter-spacing: 1.2px; color: #131212; text-transform: uppercase;
        }
        .cb-cf-det-value {
          font-size: 12px; font-weight: 700; color: #0d2523;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* Barcode */
        .cb-barcode-wrap {
          position: relative; z-index: 3;
          display: flex; justify-content: center;
          margin-top: 10px;
        }
        #cb-barcode-svg { max-width: 220px; }

        /* Footer bar */
        .cb-cf-footer-bar {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          height: 44px;
          background: linear-gradient(90deg, #62A559, #0d8a80);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .cb-footer-logo-img { width: 26px; height: 26px; object-fit: contain; flex-shrink: 0; }
        .cb-cf-footer-sep   { width: 1px; height: 16px; background: rgba(255,255,255,.3); }
        .cb-cf-footer-txt   { font-size: 10.5px; font-weight: 800; color: #fff; letter-spacing: 1px; text-transform: uppercase; }

        /* ── Back card elements ── */
        .cb-back-header {
          position: relative; z-index: 3;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 0 28px;
        }
        .cb-back-site  { font-size: 11px; font-weight: 700; color: #1aada0; letter-spacing: 1px; }
        .cb-back-title-row {
          display: flex; align-items: center; gap: 6px;
        }
        .cb-btl { width: 24px; height: 1.5px; background: #1aada0; border-radius: 2px; }
        .cb-btd { width: 5px; height: 5px; background: #1aada0; border-radius: 50%; }
        .cb-back-title {
          font-family: 'Montserrat', 'Inter', sans-serif;
          font-size: 15px; font-weight: 900;
          color: #0d2523; letter-spacing: 1px; text-transform: uppercase;
        }

        /* Shield */
        .cb-shield {
          position: relative; z-index: 3;
          margin: 12px 20px 0;
          background: linear-gradient(160deg, #62A559 0%, #0d8a80 60%, #0b7a70 100%);
          border-radius: 18px 18px 50% 50% / 18px 18px 38% 38%;
          padding: 18px 22px 56px;
          box-shadow: 0 8px 28px rgba(26,173,160,.2);
        }
        .cb-shield::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 45%;
          background: linear-gradient(180deg, rgba(255,255,255,.08), transparent);
          border-radius: inherit; pointer-events: none;
        }
        .cb-tc-item {
          position: relative; z-index: 1;
          display: flex; gap: 10px; align-items: flex-start;
          margin-bottom: 12px;
        }
        .cb-tc-item:last-of-type { margin-bottom: 0; }
        .cb-tc-num {
          flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
          background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 800; color: #fff; margin-top: 2px;
        }
        .cb-tc-text { font-size: 11.5px; line-height: 1.65; color: rgba(255,255,255,.9); flex: 1; }
        .cb-tc-text strong { font-weight: 700; color: #fff; }
        .cb-id-row {
          position: relative; z-index: 1; margin-top: 14px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .cb-id-dash { flex: 1; height: 1px; background: rgba(255,255,255,.2); }
        .cb-id-txt  { font-size: 11.5px; font-weight: 800; color: #fff; letter-spacing: .5px; white-space: nowrap; }

        /* Back footer */
        .cb-back-footer {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          padding: 0 22px 16px;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .cb-back-footer-rule {
          width: 100%; height: 1px; margin-bottom: 8px;
          background: linear-gradient(90deg, transparent, #d5eeec, transparent);
        }
        .cb-back-footer-web {
          font-size: 11px; font-weight: 900;
          letter-spacing: 2.5px; color: #1aada0; text-transform: uppercase;
        }
        .cb-back-footer-contact { font-size: 9.5px; font-weight: 600; color: #222; letter-spacing: .25px; }
        .cb-back-footer-addr    { font-size: 9px;   font-weight: 500; color: #333; }

        @media print {
          body { background-color: white; }
          .cb-page-wrap { padding: 0; }
          .cb-id-card { box-shadow: none; border: 1px solid #d1d5db; page-break-inside: avoid; }
          .cb-cf-halo::before { animation: none; }
          .cb-barcode-wrap { visibility: visible; }
        }

        /* ── Download button ── */
        .cb-download-btn {
          display: inline-flex; align-items: center; gap: 7px;
          margin-top: 4px;
          padding: 9px 22px;
          border: none; border-radius: 50px; cursor: pointer;
          background: linear-gradient(135deg, #1aada0, #579A5E);
          color: #fff; font-size: 12.5px; font-weight: 700;
          letter-spacing: .5px; text-transform: uppercase;
          box-shadow: 0 4px 14px rgba(26,173,160,.35);
          transition: opacity .2s, transform .15s;
        }
        .cb-download-btn:hover  { opacity: .88; transform: translateY(-1px); }
        .cb-download-btn:active { opacity: 1;   transform: translateY(0); }
        .cb-dl-icon { width: 15px; height: 15px; fill: #fff; flex-shrink: 0; }

        @media screen and (max-width: 768px) {
          .cb-id-card { width: 100%; max-width: 340px; }
          .cb-cards-row { gap: 24px; }
        }
      `}</style>
    </>
  );
};

const hexToRgba = (hex, opacity) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default IdCard;
