import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AndroidIcon from '@mui/icons-material/Android';
import GetAppIcon from '@mui/icons-material/GetApp';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedIcon from '@mui/icons-material/Verified';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import styles from './AppDownload.module.css';
import ThreeBackground from '../components/ThreeBackground';

const AppDownload = () => {
    const [logo, setLogo] = useState('');
    const [appName, setAppName] = useState('Icchhamati Data Service');
    const [about, setAbout] = useState('Unified Open Banking & Fintech Platform');
    const [playstoreQr, setPlaystoreQr] = useState('');
    const [playstoreUrl, setPlaystoreUrl] = useState('');
    const [themeColors, setThemeColors] = useState({ primary: '#10b981', secondary: '#06b6d4' });
    const [apkUrl, setApkUrl] = useState('/uploads/icchhamati.apk');

    useEffect(() => {
        const fetchLogoAndAppInfo = async () => {
            try {
                const res = await axios.get('/api/getLogo');
                if (res && res.data && res.data.status === 1) {
                    if (res.data.logo) setLogo(res.data.logo);
                    if (res.data.name) setAppName(res.data.name);
                    if (res.data.about) setAbout(res.data.about);
                    if (res.data.playstore_qr_img) setPlaystoreQr(res.data.playstore_qr_img);
                    if (res.data.playstore_url) {
                        setPlaystoreUrl(res.data.playstore_url);
                        // If playstore_url is an apk link, set it as primary apk url
                        if (res.data.playstore_url.endsWith('.apk')) {
                            setApkUrl(res.data.playstore_url);
                        }
                    }
                    if (res.data.color1 && res.data.color2) {
                        setThemeColors({ primary: res.data.color1, secondary: res.data.color2 });
                    }
                }
            } catch (e) {
                console.error('Failed to fetch app settings', e);
            }
        };

        fetchLogoAndAppInfo();
    }, []);

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
    };

    return (
        <div
            className={styles.pageContainer}
            style={{
                '--theme-primary': themeColors.primary,
                '--theme-secondary': themeColors.secondary,
                '--theme-primary-rgb': hexToRgb(themeColors.primary),
                '--theme-secondary-rgb': hexToRgb(themeColors.secondary),
            }}
        >
            <div className={styles.blurBlob1}></div>
            <div className={styles.blurBlob2}></div>
            <ThreeBackground />

            <div className="container position-relative py-5" style={{ zIndex: 2 }}>
                {/* Hero Section */}
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className={styles.heroCard}>
                            <div className="row align-items-center g-4">
                                <div className="col-md-7 text-center text-md-start">
                                    {logo ? (
                                        <img src={logo} alt={appName} className={styles.appLogo} />
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-3">
                                            <AndroidIcon style={{ fontSize: 40, color: themeColors.primary }} />
                                            <h3 className="fw-bold mb-0 text-white">{appName}</h3>
                                        </div>
                                    )}

                                    <h1 className={styles.title}>
                                        Download Official Mobile App
                                    </h1>
                                    <p className={styles.subtitle}>
                                        {about || 'Get fast, secure access to AEPS, Aadhaar Pay, Money Transfer, Utility Bill Payments and Micro-ATM services directly on your Android device.'}
                                    </p>

                                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 my-4">
                                        <span className={styles.badgePill}>
                                            <VerifiedIcon className="text-success" style={{ fontSize: 16 }} />
                                            v1.0.4 Official
                                        </span>
                                        <span className={styles.badgePill}>
                                            <AndroidIcon className="text-info" style={{ fontSize: 16 }} />
                                            Android 6.0+
                                        </span>
                                        <span className={styles.badgePill}>
                                            <SecurityIcon className="text-warning" style={{ fontSize: 16 }} />
                                            100% Encrypted & Safe
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-md-start gap-3 mt-4">
                                        <a
                                            href={apkUrl}
                                            download="icchhamati.apk"
                                            className={styles.primaryDownloadBtn}
                                        >
                                            <GetAppIcon style={{ fontSize: 28 }} />
                                            <span>Download Direct APK</span>
                                        </a>

                                        {playstoreUrl && (
                                            <a
                                                href={playstoreUrl}
                                                target="_blank"
                                                rel="noopener noreferrer d-none"
                                                className={styles.secondaryDownloadBtn}
                                                style={{ display: 'none' }}
                                            >
                                                <AndroidIcon style={{ fontSize: 24, color: '#34d399' }} />
                                                <span>Open Play Store</span>
                                            </a>
                                        )}
                                    </div>
                                    <div className="mt-3 text-muted small">
                                        File: <strong className="text-white">icchhamati.apk</strong> | Secure Direct Download
                                    </div>
                                </div>

                                {/* QR Code Column */}
                                <div className="col-md-5">
                                    <div className={styles.qrWrapper}>
                                        <div className="mb-2">
                                            <QrCode2Icon style={{ fontSize: 32, color: themeColors.primary }} />
                                            <h6 className="fw-bold text-white mb-1">Scan to Download</h6>
                                            <p className="small text-muted mb-3">Scan with your phone camera</p>
                                        </div>

                                        {playstoreQr ? (
                                            <div className={styles.qrContainer}>
                                                <img
                                                    src={playstoreQr}
                                                    alt="App Download QR Code"
                                                    className="w-100 h-100 object-fit-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className={styles.qrContainer}>
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/uploads/icchhamati.apk')}`}
                                                    alt="APK Download QR"
                                                    className="w-100 h-100 object-fit-contain"
                                                />
                                            </div>
                                        )}
                                        <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-1 small">
                                            Instant Mobile Scan
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Features Section */}
                <div className="row mt-5 g-4 justify-content-center">
                    <div className="col-12 text-center mb-2">
                        <h3 className="fw-bold text-white">Why Choose {appName}?</h3>
                        <p className="text-muted">Built for high performance, security, and smooth user experience</p>
                    </div>

                    <div className="col-md-3 col-sm-6">
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox}>
                                <SpeedIcon />
                            </div>
                            <h5 className="fw-bold text-white mb-2">Instant Settlements</h5>
                            <p className="small text-muted mb-0">Real-time 24x7 settlements and instant wallet updates for all your transactions.</p>
                        </div>
                    </div>

                    <div className="col-md-3 col-sm-6">
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox}>
                                <SecurityIcon />
                            </div>
                            <h5 className="fw-bold text-white mb-2">Bank Grade Security</h5>
                            <p className="small text-muted mb-0">Multi-layered security with biometric authentication and 2FA OTP verification.</p>
                        </div>
                    </div>

                    <div className="col-md-3 col-sm-6">
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox}>
                                <AccountBalanceWalletIcon />
                            </div>
                            <h5 className="fw-bold text-white mb-2">All-in-One Banking</h5>
                            <p className="small text-muted mb-0">AEPS Cash Withdrawal, Aadhaar Pay, Money Transfer, Recharges & BBPS Bill Payments.</p>
                        </div>
                    </div>

                    <div className="col-md-3 col-sm-6">
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox}>
                                <VerifiedIcon />
                            </div>
                            <h5 className="fw-bold text-white mb-2">Detailed Reports</h5>
                            <p className="small text-muted mb-0">Live transaction receipts, daily passbook statement, and instant commission credit.</p>
                        </div>
                    </div>
                </div>

                {/* Installation Steps */}
                <div className="row mt-5 justify-content-center">
                    <div className="col-lg-10">
                        <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4">
                            <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
                                <AndroidIcon className="text-success" />
                                How to Install the APK on Android:
                            </h5>

                            <div className="row g-4">
                                <div className="col-md-3 col-sm-6">
                                    <div className={styles.stepNumber}>1</div>
                                    <h6 className="fw-bold text-white">Click Download</h6>
                                    <p className="small text-muted mb-0">Tap on <strong>Download Direct APK</strong> button to download <code>icchhamati.apk</code>.</p>
                                </div>

                                <div className="col-md-3 col-sm-6">
                                    <div className={styles.stepNumber}>2</div>
                                    <h6 className="fw-bold text-white">Open File</h6>
                                    <p className="small text-muted mb-0">Open your browser Downloads folder and tap on <code>icchhamati.apk</code>.</p>
                                </div>

                                <div className="col-md-3 col-sm-6">
                                    <div className={styles.stepNumber}>3</div>
                                    <h6 className="fw-bold text-white">Allow Permissions</h6>
                                    <p className="small text-muted mb-0">If prompted, enable "Install from Unknown Sources" in your device Settings.</p>
                                </div>

                                <div className="col-md-3 col-sm-6">
                                    <div className={styles.stepNumber}>4</div>
                                    <h6 className="fw-bold text-white">Launch App</h6>
                                    <p className="small text-muted mb-0">Open {appName} app, login with your registered mobile number, and start banking!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="text-center mt-5 pt-3 border-top border-secondary border-opacity-25 text-muted small">
                    © {new Date().getFullYear()} {appName}. All rights reserved. | <a href="/signin" className="text-success text-decoration-none fw-bold">Web Login / Portal</a>
                </div>
            </div>
        </div>
    );
};

export default AppDownload;
