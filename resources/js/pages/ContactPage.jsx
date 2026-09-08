import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Material Icons
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AndroidIcon from '@mui/icons-material/Android';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import BusinessIcon from '@mui/icons-material/Business';
import LoginIcon from '@mui/icons-material/Login';

import styles from './ContactPage.module.css';

const ContactPage = () => {
    // Dynamic settings from API
    const [logo, setLogo] = useState('');
    const [footerLogo, setFooterLogo] = useState('');
    const [companyName, setCompanyName] = useState('Bharat Pay');
    const [playstoreQr, setPlaystoreQr] = useState('');
    const [playstoreUrl, setPlaystoreUrl] = useState('');
    const [themeColors, setThemeColors] = useState({ primary: '#10b981', secondary: '#06b6d4' });

    // Contact form state
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        const fetchLogoAndSettings = async () => {
            try {
                const res = await axios.get('/api/getLogo');
                if (res && res.data && res.data.status === 1) {
                    if (res.data.logo) setLogo(res.data.logo);
                    if (res.data.footer_logo) setFooterLogo(res.data.footer_logo);
                    if (res.data.name) setCompanyName(res.data.name);
                    if (res.data.playstore_qr_img) setPlaystoreQr(res.data.playstore_qr_img);
                    if (res.data.playstore_url) setPlaystoreUrl(res.data.playstore_url);
                    if (res.data.color1 && res.data.color2) {
                        setThemeColors({ primary: res.data.color1, secondary: res.data.color2 });
                    }
                }
            } catch (e) {
                console.error('Failed to fetch settings logo', e);
            }
        };

        fetchLogoAndSettings();
    }, []);

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/contact-us', form);
            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Thank you! Your message has been sent successfully.');
                setForm({ name: '', email: '', subject: '', message: '' });
                setSubmitSuccess(true);
            } else {
                toast.error(res.data?.message || 'Failed to send message. Please try again.');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to send message. Please check your network connection.');
        }
        setLoading(false);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <ToastContainer position="top-right" autoClose={4000} />

            {/* Ambient Background Blobs */}
            <div className={styles.blurBlob1}></div>
            <div className={styles.blurBlob2}></div>

            {/* Navigation Header */}
            <nav className={styles.navbar}>
                <div className="container d-flex align-items-center justify-content-between">
                    <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
                        {logo ? (
                            <img src={logo} alt={companyName} className={styles.navLogo} />
                        ) : (
                            <span className="fw-bold text-white fs-4">{companyName}</span>
                        )}
                    </Link>

                    <div className="d-none d-md-flex align-items-center gap-3">
                        <Link to="/" className={styles.navLink}>Home</Link>
                        <Link to="/signin" className={styles.navLink}>Services</Link>
                        <Link to="/app-download" className={styles.navLink}>App Download</Link>
                        <Link to="/contact-2" className={`${styles.navLink} ${styles.navLinkActive}`}>Contact Us</Link>
                    </div>

                    <div>
                        <Link to="/signin" className={styles.portalBtn}>
                            <LoginIcon fontSize="small" />
                            <span>Sign In / Portal</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="container position-relative py-4" style={{ zIndex: 2 }}>
                {/* Hero Title Section */}
                <div className={styles.heroHeader}>
                    <span className={styles.heroTag}>24/7 SUPPORT & ASSISTANCE</span>
                    <h1 className={styles.heroTitle}>We Are Here To Help You</h1>
                    <p className={styles.heroSubtitle}>
                        Have questions, need API assistance, or want to discuss partnership opportunities? Reach out to our dedicated support team.
                    </p>
                </div>

                {/* Left & Right Two Column Section */}
                <div className="row g-4 mt-2 justify-content-center">
                    {/* Left Column: Contact Form */}
                    <div className="col-lg-6">
                        <div className={styles.glassCard}>
                            <div className={styles.cardHeaderTitle}>
                                <ContactSupportIcon />
                                <span>Get in Touch</span>
                            </div>

                            {submitSuccess && (
                                <div className="alert alert-success border-0 bg-success bg-opacity-20 text-success rounded-3 p-3 mb-4">
                                    ✓ Thank you! Your message has been sent successfully. A confirmation email has been dispatched to your inbox.
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Your Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className={styles.customInput}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Your Email <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                        className={styles.customInput}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Subject <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        placeholder="Enter message subject"
                                        className={styles.customInput}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Your Message <span className="text-danger">*</span></label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Write your message or inquiry here..."
                                        className={styles.customTextarea}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={styles.submitBtn}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            <span>Sending Message...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SendIcon fontSize="small" />
                                            <span>Submit Message</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Visit Us Info */}
                    <div className="col-lg-6">
                        <div className={styles.glassCard}>
                            <div className={styles.cardHeaderTitle}>
                                <BusinessIcon />
                                <span>Visit Us</span>
                            </div>

                            {/* Email Item */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoIconBox}>
                                    <EmailIcon />
                                </div>
                                <div>
                                    <div className={styles.infoContentTitle}>Official Email</div>
                                    <div className={styles.infoContentValue}>
                                        <a href="mailto:ads@bharatpays.in">ads@bharatpays.in</a>
                                    </div>
                                </div>
                            </div>

                            {/* Office Support No Item */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoIconBox}>
                                    <PhoneIcon />
                                </div>
                                <div>
                                    <div className={styles.infoContentTitle}>Office Support No</div>
                                    <div className={styles.infoContentValue}>
                                        <a href="tel:8436132456">Call & Whatsapp 8436132456</a>
                                    </div>
                                </div>
                            </div>

                            {/* Api Support No Item */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoIconBox}>
                                    <WhatsAppIcon />
                                </div>
                                <div>
                                    <div className={styles.infoContentTitle}>Api Support No</div>
                                    <div className={styles.infoContentValue}>
                                        <a href="https://wa.me/919093030417" target="_blank" rel="noopener noreferrer">
                                            Call & Whatsapp 9093030417
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Open Time Item */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoIconBox}>
                                    <AccessTimeIcon />
                                </div>
                                <div>
                                    <div className={styles.infoContentTitle}>Operating Hours</div>
                                    <div className={styles.infoContentValue}>
                                        Open Time - 9:00 AM to 8:00 PM / Sunday Full Off
                                    </div>
                                </div>
                            </div>

                            {/* Address Item */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoIconBox}>
                                    <LocationOnIcon />
                                </div>
                                <div>
                                    <div className={styles.infoContentTitle}>Office Address</div>
                                    <div className={styles.infoContentValue}>
                                        Netajinagar, Bongaon, Ghatbaor, Ramchandrapur Bazar, North 24 Parganas, Kolkata, West Bengal, Pin-743235
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section After Left & Right Side: Account Deletion Instructions */}
                <div className="row justify-content-center">
                    <div className="col-lg-12">
                        <div className={styles.deletionCard}>
                            <div className={styles.deletionHeader}>
                                <DeleteForeverIcon style={{ fontSize: 30, color: '#ef4444' }} />
                                <h3 className={styles.deletionTitle}>How to delete my account?</h3>
                            </div>
                            <p className={styles.deletionText}>
                                To delete your account, first contact our support team through the provided mobile number or email.
                                Then, submit your login details along with a valid reason for closing your account.
                                Once verified, your account will be permanently deleted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Footer Matching User Image */}
            <footer className={styles.footerContainer}>
                <div className="container">
                    <div className="row g-4">
                        {/* Company Info Column */}
                        <div className="col-lg-4 col-md-6">
                            {(footerLogo || logo) && (
                                <img src={footerLogo || logo} alt={companyName} style={{ height: '48px', objectFit: 'contain' }} className="mb-3" />
                            )}
                            <div className={styles.footerCompanyTitle}>
                                ICCHHAMATI DATA SERVICE PRIVATE LIMITED
                            </div>
                            <p className={styles.footerCompanyDetails}>
                                (CIN:- U72900WB2021PTC244458) (GST NO:- 19AAVCA758M1ZW) (MSME:- UDYAM-WB-14-0003578) is a Private company incorporated on 10 Dec 2021.
                            </p>

                            {/* Social Icons */}
                            <div className={styles.socialIcons}>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIconBtn} title="Facebook">
                                    <FacebookIcon fontSize="small" />
                                </a>
                                <a href="https://wa.me/918436132456" target="_blank" rel="noopener noreferrer" className={styles.socialIconBtn} title="WhatsApp">
                                    <WhatsAppIcon fontSize="small" />
                                </a>
                                <a href="https://google.com" target="_blank" rel="noopener noreferrer" className={styles.socialIconBtn} title="Google">
                                    <GoogleIcon fontSize="small" />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIconBtn} title="Instagram">
                                    <InstagramIcon fontSize="small" />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialIconBtn} title="YouTube">
                                    <YouTubeIcon fontSize="small" />
                                </a>
                                {playstoreUrl && (
                                    <a href={playstoreUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIconBtn} title="PlayStore">
                                        <AndroidIcon fontSize="small" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Navigation Links Column */}
                        <div className="col-lg-3 col-md-6">
                            <h4 className={styles.footerSectionTitle}>Company</h4>
                            <ul className={styles.footerLinksList}>
                                <li><Link to="/">About</Link></li>
                                <li><Link to="/signin">Services</Link></li>
                                <li><Link to="/terms">Terms & Conditions</Link></li>
                                <li><Link to="/refund">Refund Policy</Link></li>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                                <li><Link to="/cancellation">Cancellation Policy</Link></li>
                                <li>
                                    <button onClick={scrollToTop} className={styles.footerLinkBtn}>
                                        Back to top <ArrowUpwardIcon style={{ fontSize: 14 }} />
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Get In Touch Column */}
                        <div className="col-lg-5 col-md-12">
                            <h4 className={styles.footerSectionTitle}>Get In Touch</h4>
                            <div className={styles.contactInfoText}>
                                <strong>Office Address:-</strong> Netajinagar, Bongaon, Ghatbaor, Ramchandrapur Bazar, North 24 Parganas, Kolkata, West Bengal, Pin-743235
                            </div>
                            <div className={styles.contactInfoText}>
                                <strong>Email Id :-</strong> <a href="mailto:ads@bharatpays.in" className="text-white text-decoration-none">ads@bharatpays.in</a>
                            </div>
                            <div className={styles.contactInfoText}>
                                <strong>Office Support No-</strong><br />
                                Call & Whatsapp:- <a href="tel:8436132456" className="text-white text-decoration-none">8436132456</a>
                            </div>
                            <div className={styles.contactInfoText}>
                                <strong>Api Support No-</strong><br />
                                Call & Whatsapp:- <a href="tel:9093030417" className="text-white text-decoration-none">9093030417</a>
                            </div>
                            <div className={styles.contactInfoText}>
                                <strong>Open Time :-</strong>9:00 AM to 8:00 PM<br />
                                Sunday Full Off
                            </div>


                        </div>
                    </div>
                </div>

                {/* Bottom Copyright Bar */}
                <div className={styles.bottomCopyrightBar}>
                    Copyright © 2026 IDSPL Icchhamati Data Service Pvt. Ltd. | Powered by IDSPL Icchhamati Data Service Pvt. Ltd.
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
