import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../core/hooks/context';
import { apiUrl } from '../core/config';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import shopImage from './shop-cashbez.png';
import logo from './logo-black.png';
/* ─────────────────────────────────────────────────────────────────────────────
   SHOP BANNER  –  7 ft × 3 ft  ·  300 DPI
   Inspired by classic Indian Aadhaar / Micro-ATM shop banners.
   Theme colours from IdCard.jsx:
     Primary  : #1aada0  (teal)
     Secondary: #579A5E  (green)
     Dark     : #0d2523
     Accent   : #f5a623  (amber / arrow colour)
───────────────────────────────────────────────────────────────────────────── */

const SERVICES = [
    { name: 'AEPS', hi: 'एईपीएस' },
    { name: 'CASH DEPOSIT', hi: 'कैश डिपॉजिट' },
    { name: 'M-ATM', hi: 'माइक्रो एटीएम' },
    { name: 'BILL PAYMENT', hi: 'बिल पेमेंट' },
    { name: 'MOBILE RECHARGE', hi: 'मोबाइल रिचार्ज' },
    { name: 'MONEY TRANSFER', hi: 'मनी ट्रांसफर' },
    { name: 'GST FILING', hi: 'जीएसटी' },
    { name: 'ITR FILING', hi: 'आईटीआर' },
    { name: 'CIBIL SCORE', hi: 'सिबिल स्कोर' },
];

/* Cols: split into two equal columns for the arrow-list layout */
const LEFT_SERVICES = SERVICES.slice(0, Math.ceil(SERVICES.length / 2));
const RIGHT_SERVICES = SERVICES.slice(Math.ceil(SERVICES.length / 2));

const hexToRgba = (hex, opacity) => {
    const b = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(b >> 16) & 255},${(b >> 8) & 255},${b & 255},${opacity})`;
};

/* ─── Arrow SVG (orange → matches reference image) ─── */
const Arrow = () => (
    <svg viewBox="0 0 36 20" className="sb-arrow-svg">
        <defs>
            <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f5a623" />
                <stop offset="100%" stopColor="#e08000" />
            </linearGradient>
        </defs>
        <polygon points="0,4 24,4 24,0 36,10 24,20 24,16 0,16" fill="url(#arrowGrad)" />
    </svg>
);

/* ─── Brand logo pills shown in the header ─── */
const BRANDS = ['AEPS', 'AADHAAR', 'NPCI', 'YES BANK', 'AIRTEL'];

/* ─── Generate physical line elements for background pattern ─── */
const generateLines = () => {
    const lines = [];
    const W = 168 * 96;  // banner width in px (8064)
    const H = 160 * 96;  // banner height in px (2880)
    const gap1 = 1.6 * 96; // 1.6in gap for 135° lines
    const gap2 = 1.6 * 96; // 1.6in gap for 45° lines
    const len = Math.sqrt(W * W + H * H); // diagonal length

    // 135° lines
    for (let i = -H; i < W + H; i += gap1) {
        lines.push(
            <div key={`a${i}`} style={{
                position: 'absolute',
                left: i + 'px', top: -len / 2 + H / 2 + 'px',
                width: '5px', height: len + 'px',
                background: 'rgba(10, 90, 60, 0.06)',
                transform: 'rotate(-45deg)',
                transformOrigin: 'top center',
                pointerEvents: 'none',
            }} />
        );
    }
    // 45° lines
    for (let i = -H; i < W + H; i += gap2) {
        lines.push(
            <div key={`b${i}`} style={{
                position: 'absolute',
                left: i + 'px', top: -len / 2 + H / 2 + 'px',
                width: '4px', height: len + 'px',
                background: 'rgba(10,90,60,0.06)',
                transform: 'rotate(45deg)',
                transformOrigin: 'top center',
                pointerEvents: 'none',
            }} />
        );
    }
    return lines;
};
const PATTERN_LINES = generateLines();

const ShopBanner = () => {
    const context = useContext(AuthContext);
    const { userData: user } = context || {};
    const location = useLocation();
    const pathSegs = location.pathname.split('/').filter(Boolean);
    const lastPath = pathSegs[pathSegs.length - 1];
    const userMid = (lastPath && lastPath !== 'shop-banner') ? lastPath : (user?.mid || '');

    const bannerRef = useRef(null);
    const wrapRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0.15);

    /* ── Calculate zoom to fit banner in viewport ── */
    const calcZoom = useCallback(() => {
        // Use page container width (viewport minus padding)
        const pageEl = wrapRef.current?.parentElement;
        if (!pageEl) return;
        const availW = pageEl.clientWidth - 24; // minus padding
        const bannerPx = 84 * 96; // 84in at 96px/in = 8064px
        setZoomLevel(availW / bannerPx);
    }, []);

    useEffect(() => {
        calcZoom();
        window.addEventListener('resize', calcZoom);
        return () => window.removeEventListener('resize', calcZoom);
    }, [calcZoom]);

    const [state, setState] = useState({
        adminData: null,
        shopData: {
            name: '',
            designation: '',
            code: userMid || '',
            phone: '',
            email: '',
            address: '',
            photo: '',
            company_phone: '',
            company_email: '',
            company_address: '',
            company_website: '',
        },
        photoPreview: '',
        logoSrc: 'https://cdn.enexaerp.com/settings/1769957400722_7c00t5.webp',
        isLoading: true,
        loadingMsg: 'Loading banner…',
    });

    useEffect(() => { if (userMid) fetchUserData(userMid); }, [userMid]);

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
                    shop_name: adminData1?.shop_name || '',
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


    /* domain */
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const mainDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
    const websiteUrl = state.shopData.company_website || ('www.' + mainDomain);

    /* QR url */
    const qrUrl = `${apiUrl}/api/qr-generate-v27?text=${encodeURIComponent(
        window.location.origin + '/user/' + btoa(state.shopData.code || 'user')
    )}`;

    /* ── PDF download ── */
    const downloadPDF = async () => {
        if (!bannerRef.current) return;
        setDownloading(true);
        try {
            const el = bannerRef.current;
            // Temporarily reset zoom to 1 for full-size capture
            const origZoom = el.style.zoom;
            el.style.zoom = '1';

            const canvas = await html2canvas(el, {
                scale: 2, useCORS: true, allowTaint: true,
                backgroundColor: '#ffffff', logging: false,
                width: el.scrollWidth,
                height: el.scrollHeight,
            });

            // Restore zoom
            el.style.zoom = origZoom;

            // 84 in × 30 in  →  mm
            const W_MM = 84 * 25.4; // 2133.6 mm
            const H_MM = 30 * 25.4; //  762.0 mm
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W_MM, H_MM] });
            pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, W_MM, H_MM, '', 'FAST');
            pdf.save(`${state.shopData.name || 'shop'}-banner.pdf`);
        } catch (e) { console.error(e); }
        finally { setDownloading(false); }
    };

    /* ══════════════════════════════════════════════════════
       LOADER
    ══════════════════════════════════════════════════════ */
    if (state.isLoading) return (
        <div className="sb-loader-wrap">
            <div className="sb-loader-box">
                <div className="sb-spinner-wrap">
                    <div className="sb-spinner" /><div className="sb-spinner-inner" />
                </div>
                <h3 className="sb-loader-title">{state.loadingMsg}</h3>
                <p className="sb-loader-sub">Preparing your shop banner…</p>
                <div className="sb-progress"><div className="sb-progress-fill" /></div>
            </div>
            <style jsx>{`
            
            `}</style>
        </div>
    );

    /* ══════════════════════════════════════════════════════
       BANNER RENDER
    ══════════════════════════════════════════════════════ */
    return (
        <>
            <div className="sb-page">

                {/* ── page title ── */}
                <div className="sb-page-header">
                    <h2 className="sb-page-title">Shop Banner Preview</h2>
                    <p className="sb-page-sub">84" × 30" (7 ft × 2.5 ft) &nbsp;·&nbsp; 300 DPI Print Quality</p>
                </div>

                {/* ══ BANNER ══════════════════════════════════════════ */}
                <div className="sb-scroll-wrap" ref={wrapRef}>
                    <div className="sb-banner" ref={bannerRef} id="sb-banner-main"
                        style={{ zoom: zoomLevel }}>

                        {/* Physical line pattern for PDF */}
                        <div className="sb-pattern-box">{PATTERN_LINES}</div>
                        {/* Accent top bar - real DOM */}
                        <div className="sb-accent-bar" />

                        <div className='shop-header'>
                            <div className="pro">
                                <h4>proprietor - {state.employeeData.name || 'Employee Name'}</h4>
                            </div>
                            <div className="contact">
                                <h4>CONTACT - +91 {state.employeeData.phone || '—'}</h4>
                            </div>
                        </div>
                        <div className='img'>
                            <img src={shopImage} width="1880" className='shop-image' alt='Shop Image' />
                        </div>

                        <div className='brand'>

                            <div className="logo">
                                <img src={logo} width="1200" />
                            </div>
                            <h2>Payment Service</h2>
                            <h3>
                                ग्राहक सेवा केंद्र
                            </h3>
                            <div className="banks">
                                <h4>ALL BANKS</h4>
                            </div>

                            <div className="sp">
                                <div className="web">
                                    <div className="ico">
                                        <div className="fa fa-globe"></div>
                                    </div>
                                    <p>www.cashbez.com</p>
                                </div>
                                <div className="phone">
                                    <div className="ico">
                                        <div className="fa fa-phone"></div>
                                    </div>
                                    <p>+91 01169266060</p>
                                </div>
                            </div>

                        </div>


                        <div className='shop-footer'>
                            <h1>{state.employeeData.shop_name || 'Shop Name'}</h1>
                        </div>

                    </div>{/* /.sb-banner */}
                </div>

                {/* ── DOWNLOAD BUTTON ── */}
                <div className="sb-actions">
                    <button
                        className={`sb-dl-btn${downloading ? ' sb-dl-btn--busy' : ''}`}
                        onClick={downloadPDF}
                        disabled={downloading}
                    >
                        <svg viewBox="0 0 24 24" className="sb-dl-icon">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-14 9v2h14v-2H5z" />
                        </svg>
                        {downloading ? 'Generating PDF…' : 'Download PDF'}
                    </button>
                    <span className="sb-dl-note">84" × 30" · 300 DPI · Print Ready</span>
                </div>

            </div>

            {/* ══════════════════════════════════════════════════════
                STYLES
            ══════════════════════════════════════════════════════ */}
            <style jsx>{`
                /* ── Page shell ── */
                .sb-page {
                    display: flex; flex-direction: column; align-items: center;
                    padding: 24px 12px 56px;
                    font-family: 'Inter','Segoe UI',sans-serif;
                    min-height: 100vh;
                }
                .sb-page-header { text-align: center; margin-bottom: 18px; }
                .sb-page-title  { font-size: 20px; font-weight: 800; color: #0d2523; margin: 0 0 4px; }
                .sb-page-sub    { font-size: 12px; color: #6b7280; margin: 0; }

                /* ── Scroll wrapper ── */
                .sb-scroll-wrap {
                    width: 100%;
                    overflow: hidden;
                    border-radius: 10px;
                    box-shadow: 0 10px 48px rgba(0,0,0,.2), 0 2px 8px rgba(0,0,0,.1);
                }

                /* ══ BANNER CONTAINER ══ */
                .sb-banner {
                   font-family: arial;
                    position: relative;
                    width: 84in;
                    height: 30in;
                    display: flex; 
                    flex-direction: row;
                    align-items: center;
                    padding: 1.25in 5in;
                    background: linear-gradient(160deg, #e8faf3 0%, #d4f5e9 30%, #e3f7ef 60%, #daf0e5 100%);
                    overflow: hidden;
                }

                /* Pattern container */
                .sb-pattern-box {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: 0;
                    overflow: hidden;
                    pointer-events: none;
                }

                /* Accent top bar */
                .sb-accent-bar {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 0.4in;
                    background: linear-gradient(90deg, #0e6b45, #1aada0, #54a01c, #c8952e, #1aada0, #0e6b45);
                    z-index: 3;
                }

                .sb-banner > *:not(.sb-pattern-box):not(.sb-accent-bar) {
                    position: relative;
                    z-index: 1;
                }

                .shop-image {
                    margin-top:-3in;
                    width: 28in;
                    height: auto;
                }

                .logo img{
                    width: 20in;
                    height: auto;
                }

                .brand, .img {
                    flex: 1;
                }

                .brand{
                    margin-top:-3in;
                    text-align: center;
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                }

                .img{
                    text-align: center;
                }

                .brand h2{
                    font-weight: bold;
                    font-size: 2.5in;
                    color: #0b3d2e;
                }

                .brand h3{
                    font-weight: bold;
                    font-size: 4in;
                    color: #0b3d2e;
                    margin-top: 1.2in;
                }

                .brand .banks h4{
                    font-weight: bold;
                    font-size: 1.8in;
                    color: #0b3d2e;
                }

                .brand .banks {
                    position: relative;
                    width: 24.5in;
                }

                .brand .banks:before, .brand .banks:after{
                    content: "";
                    background: linear-gradient(90deg, #c8952e, #d4a843);
                    width: 6.4in;
                    height: 0.5in;
                    top: 50%;
                    margin-top: -0.25in;
                    position: absolute;
                    border-radius: 0.1in;
                }
                .brand .banks:before{
                    left: 0;
                }
                .brand .banks:after{
                    right: 0;
                }

                .brand .sp{
                    display: flex;
                    gap:1.1in;
                    justify-content: center;
                    margin-top: 0.3in;
                }

                .brand .sp .web, .brand .sp  .phone{
                    font-weight: bold;
                    font-size: 1.125in;
                    display: flex;
                    color: #0b3d2e;
                    gap:0.4in;
                    align-items: center;
                }

                .brand .sp .ico {
                    width: 1.4in;
                    height: 1.4in;
                    background: linear-gradient(135deg, #0e6b45, #1aada0);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.7in;
                }


                .shop-header{
                    width: 100%;
                    position: absolute !important;
                    top: 0.4in;
                    left: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.85in 5in;
                    text-transform: uppercase;
                }

                .shop-header h4{
                    font-size: 1in;
                    color: #0b3d2e;
                    font-weight: bold;
                    letter-spacing: 0.05in;
                }

                .shop-footer {
                    background: linear-gradient(90deg, #031f17, #063d2e, #052920, #063d2e, #031f17);
                    height: 5in;
                    width: 100%;
                    position: absolute !important;
                    bottom:0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    left:0;
                    border-top: 0.2in solid #c8952e;
                }

                .shop-footer h1{
                   text-transform: uppercase;
                   font-size: 3.5in;
                   text-align: center;
                   font-weight: bold;
                   color: white;
                   letter-spacing: 0.15in;
                   text-shadow: 0 0.08in 0.2in rgba(0,0,0,0.3);
                }

                /* ════════════════════════════════════
                   DOWNLOAD BUTTON
                ════════════════════════════════════ */
                .sb-actions {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 6px; margin-top: 20px;
                }
                .sb-dl-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 12px 36px; border: none; border-radius: 50px; cursor: pointer;
                    background: linear-gradient(135deg, #1aada0, #579A5E);
                    color: #fff; font-size: 14px; font-weight: 700; letter-spacing: .5px;
                    text-transform: uppercase;
                    box-shadow: 0 4px 18px rgba(26,173,160,.4);
                    transition: opacity .2s, transform .15s;
                }
                .sb-dl-btn:hover:not(:disabled)  { opacity: .88; transform: translateY(-2px); }
                .sb-dl-btn:active:not(:disabled)  { transform: translateY(0); }
                .sb-dl-btn--busy, .sb-dl-btn:disabled { opacity: .65; cursor: not-allowed; }
                .sb-dl-icon  { width: 16px; height: 16px; fill: #fff; }
                .sb-dl-note  { font-size: 11px; color: #9ca3af; letter-spacing: .3px; }

                /* ─ print ─ */
                @media print {
                    .sb-page { padding: 0; }
                    .sb-scroll-wrap { box-shadow: none; }
                    .sb-actions { display: none; }
                }
            `}</style>
        </>
    );
};

export default ShopBanner;
