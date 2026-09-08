import React, { useState, useEffect, useRef } from 'react';
import { PopupService } from '../core/services/PopupService';

const DynamicPopup = ({ screen = 'home', isLoginScreen = false, userId = null, onDismiss }) => {
    const [popup, setPopup] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showCloseButton, setShowCloseButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, aspectRatio: 1 });
    const [modalSize, setModalSize] = useState({ width: 'auto', height: 'auto' });
    const timerRef = useRef(null);
    const closeTimerRef = useRef(null);

    useEffect(() => {
        loadPopup();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        };
    }, [screen, userId]);

    // Handle window resize for responsive behavior
    useEffect(() => {
        const handleResize = () => {
            if (imageDimensions.width > 0) {
                calculateModalSize(imageDimensions.width, imageDimensions.height);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [imageDimensions]);

    const loadPopup = async () => {
        setLoading(true);
        let data = null;

        if (isLoginScreen) {
            if (userId) {
                data = await PopupService.fetchPublicPopup(userId, screen);
            }
        } else {
            data = await PopupService.fetchPopup(screen);
        }

        if (data) {
            // Check client-side localStorage cache for once / once_per_day frequency
            try {
                const localDismissed = localStorage.getItem(`popup_dismissed_${data.id}`);
                const todayStr = new Date().toDateString();
                if (data.display_frequency === 'once' && localDismissed) {
                    setLoading(false);
                    return;
                }
                if (data.display_frequency === 'once_per_day' && localDismissed === todayStr) {
                    setLoading(false);
                    return;
                }
            } catch (e) {}

            // Immediately mark as dismissed for today on server and client when fetched/shown
            if (!isLoginScreen && (data.display_frequency === 'once' || data.display_frequency === 'once_per_day' || !data.is_repeatable)) {
                try {
                    localStorage.setItem(`popup_dismissed_${data.id}`, new Date().toDateString());
                } catch (e) {}
                PopupService.dismissPopup(data.id).catch(() => {});
            }

            const showDelay = (data.show_after_seconds || 0) * 1000;
            
            timerRef.current = setTimeout(() => {
                setPopup(data);
                
                // If there's an image, preload it to get dimensions
                if (data.image_url) {
                    preloadImage(data.image_url, data);
                } else {
                    // No image - use content-based sizing
                    setModalSize({ width: 400, height: 'auto' });
                    setImageLoaded(true);
                    setIsVisible(true);
                    setupCloseTimer(data);
                }
            }, showDelay);
        }
        setLoading(false);
    };

    const preloadImage = (imageUrl, popupData) => {
        const img = new Image();
        img.onload = () => {
            const dimensions = {
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight
            };
            setImageDimensions(dimensions);
            calculateModalSize(dimensions.width, dimensions.height);
            setImageLoaded(true);
            setIsVisible(true);
            setupCloseTimer(popupData);
        };
        img.onerror = () => {
            // Image failed to load - proceed without image sizing
            setModalSize({ width: 400, height: 'auto' });
            setImageLoaded(true);
            setIsVisible(true);
            setupCloseTimer(popupData);
        };
        img.src = imageUrl;
    };

    const calculateModalSize = (imgWidth, imgHeight) => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const padding = 40; // Edge padding
        
        const maxAvailableWidth = screenWidth - padding;
        const maxAvailableHeight = screenHeight - padding;
        const aspectRatio = imgWidth / imgHeight;
        
        let width = imgWidth;
        let height = imgHeight;
        
        // Scale down if exceeds screen bounds while maintaining aspect ratio
        if (width > maxAvailableWidth) {
            width = maxAvailableWidth;
            height = width / aspectRatio;
        }
        if (height > maxAvailableHeight) {
            height = maxAvailableHeight;
            width = height * aspectRatio;
        }
        
        // Ensure minimum size for readability
        const minWidth = Math.min(320, screenWidth * 0.9);
        width = Math.max(width, minWidth);
        
        setModalSize({ width, height });
    };

    const setupCloseTimer = (popupData) => {
        const closeDelay = (popupData.auto_close_seconds || 5) * 1000;
        closeTimerRef.current = setTimeout(() => {
            setShowCloseButton(true);
        }, closeDelay);
    };

    const handleDismiss = async () => {
        setIsVisible(false);
        if (popup && !isLoginScreen) {
            try {
                localStorage.setItem(`popup_dismissed_${popup.id}`, new Date().toDateString());
            } catch (e) {}

            if (popup.display_frequency === 'once' || popup.display_frequency === 'once_per_day' || !popup.is_repeatable) {
                await PopupService.dismissPopup(popup.id);
            }
        }
        if (onDismiss) onDismiss();
    };

    const handleButtonAction = () => {
        const link = popup?.button_link || popup?.redirect_url;
        if (!link) {
            handleDismiss();
            return;
        }

        const isExternal = link.startsWith('http://') || link.startsWith('https://');

        if (isExternal) {
            window.open(link, '_blank');
        } else {
            if (isLoginScreen) {
                if (window.toast) window.toast.warning('Please login to access this feature');
                else alert('Please login to access this feature');
            } else {
                window.location.href = link; 
            }
        }
        handleDismiss();
    };

    if (!isVisible || !popup) return null;

    // Enhanced Color Palettes
    const getColors = () => {
        switch (popup.popup_type) {
            case 'offer':
                return { 
                    bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', 
                    headerBg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    border: '#F97316', 
                    text: '#9A3412',
                    headerText: '#FFFFFF',
                    btnGradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    shadow: 'rgba(249, 115, 22, 0.3)'
                }; 
            case 'renewal_reminder':
                return { 
                    bg: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', 
                    headerBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    border: '#EF4444', 
                    text: '#991B1B',
                    headerText: '#FFFFFF',
                    btnGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    shadow: 'rgba(239, 68, 68, 0.3)'
                };
            case 'announcement':
                return { 
                    bg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', 
                    headerBg: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    border: '#22C55E', 
                    text: '#166534',
                    headerText: '#FFFFFF',
                    btnGradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    shadow: 'rgba(34, 197, 94, 0.3)'
                };
            case 'general': 
            default:
                return { 
                    bg: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)', 
                    headerBg: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    border: '#06B6D4', 
                    text: '#155E75',
                    headerText: '#FFFFFF',
                    btnGradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    shadow: 'rgba(6, 182, 212, 0.3)'
                };
        }
    };

    const colors = getColors();
    const isBackgroundImage = popup.image_position === 'background' && popup.image_url;
    const hasImage = popup.image_url;

    // Close Button Component
    const CloseButton = ({ light = false }) => (
        showCloseButton && popup.is_dismissible && (
            <button 
                onClick={handleDismiss}
                className="popup-close-btn"
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: light ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: light ? '#1F2937' : colors.text,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s, background 0.2s',
                    zIndex: 20
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        )
    );

    // Action Button Component
    const ActionButton = () => (
        popup.button_text && (
            <button
                onClick={handleButtonAction}
                className="popup-action-btn"
                style={{
                    width: '100%',
                    background: colors.btnGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: `0 8px 24px -6px ${colors.shadow}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}
                onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 12px 28px -8px ${colors.shadow}`;
                }}
                onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `0 8px 24px -6px ${colors.shadow}`;
                }}
            >
                {popup.button_text}
            </button>
        )
    );

    // Render based on image position
    const renderContent = () => {
        // BACKGROUND MODE - Title OUTSIDE/ABOVE image
        if (isBackgroundImage) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: modalSize.width,
                    maxWidth: '100%',
                    background: '#ffffff',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: `0 25px 80px -20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset`,
                    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                }}>
                    <CloseButton light={false} />
                    
                    {/* Title Header - OUTSIDE image */}
                    {(popup.title || popup.message) && (
                        <div style={{
                            background: colors.headerBg,
                            padding: '24px 48px 24px 24px',
                            textAlign: 'center'
                        }}>
                            {popup.title && (
                                <h3 style={{ 
                                    margin: 0,
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    color: colors.headerText,
                                    letterSpacing: '-0.02em'
                                }}>
                                    {popup.title}
                                </h3>
                            )}
                            {popup.message && (
                                <p style={{ 
                                    margin: popup.title ? '8px 0 0 0' : 0,
                                    fontSize: '15px',
                                    lineHeight: '1.5',
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: '400'
                                }}>
                                    {popup.message}
                                </p>
                            )}
                        </div>
                    )}
                    
                    {/* Full Image - Dynamic Size */}
                    <div style={{ 
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <img 
                            src={popup.image_url} 
                            alt={popup.title || 'Popup'} 
                            onClick={handleButtonAction}
                            style={{ 
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                cursor: (popup.redirect_url || popup.button_link) ? 'pointer' : 'default'
                            }}
                        />
                    </div>
                    
                    {/* Action Button Footer */}
                    {popup.button_text && (
                        <div style={{
                            padding: '20px 24px',
                            background: colors.bg
                        }}>
                            <ActionButton />
                        </div>
                    )}
                </div>
            );
        }

        // TOP IMAGE MODE
        if (popup.image_position === 'top' && hasImage) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: modalSize.width,
                    maxWidth: '100%',
                    background: colors.bg,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: `0 25px 80px -20px rgba(0, 0, 0, 0.3), 0 0 0 1px ${colors.border}30`,
                    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                }}>
                    <CloseButton light={true} />
                    
                    {/* Image at Top - Dynamic Height */}
                    <div style={{ 
                        width: '100%',
                        maxHeight: modalSize.height ? modalSize.height * 0.5 : '40vh',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <img 
                            src={popup.image_url} 
                            alt={popup.title || 'Popup'} 
                            style={{ 
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                objectFit: 'cover'
                            }}
                        />
                        {/* Gradient fade */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '60px',
                            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))',
                            pointerEvents: 'none'
                        }} />
                    </div>
                    
                    {/* Content Below */}
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                        {popup.title && (
                            <h3 style={{ 
                                margin: '0 0 12px 0',
                                fontSize: '24px',
                                fontWeight: '700',
                                color: colors.text,
                                letterSpacing: '-0.02em'
                            }}>
                                {popup.title}
                            </h3>
                        )}
                        {popup.message && (
                            <p style={{ 
                                margin: 0,
                                fontSize: '16px',
                                lineHeight: '1.6',
                                color: '#4B5563'
                            }}>
                                {popup.message}
                            </p>
                        )}
                        {popup.button_text && (
                            <div style={{ marginTop: '24px' }}>
                                <ActionButton />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // CENTER IMAGE MODE (default) or NO IMAGE
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: hasImage ? modalSize.width : Math.min(450, window.innerWidth - 40),
                maxWidth: '100%',
                background: colors.bg,
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: `0 25px 80px -20px rgba(0, 0, 0, 0.3), 0 0 0 1px ${colors.border}30`,
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative'
            }}>
                <CloseButton light={false} />
                
                {/* Content */}
                <div style={{ padding: '32px 24px 24px 24px', textAlign: 'center' }}>
                    {popup.title && (
                        <h3 style={{ 
                            margin: '0 0 12px 0',
                            fontSize: '24px',
                            fontWeight: '700',
                            color: colors.text,
                            letterSpacing: '-0.02em'
                        }}>
                            {popup.title}
                        </h3>
                    )}
                    {popup.message && (
                        <p style={{ 
                            margin: 0,
                            fontSize: '16px',
                            lineHeight: '1.6',
                            color: '#4B5563'
                        }}>
                            {popup.message}
                        </p>
                    )}
                    
                    {/* Center Image - Dynamic */}
                    {popup.image_position === 'center' && hasImage && (
                        <div style={{ 
                            margin: '24px -12px 8px -12px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                        }}>
                            <img 
                                src={popup.image_url} 
                                alt={popup.title || 'Popup'} 
                                style={{ 
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                    )}
                    
                    {popup.button_text && (
                        <div style={{ marginTop: '24px' }}>
                            <ActionButton />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            {/* Loading State */}
            {!imageLoaded && hasImage && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid rgba(255,255,255,0.2)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                </div>
            )}
            
            {/* Popup Content */}
            {imageLoaded && renderContent()}
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to { opacity: 1; backdrop-filter: blur(8px); }
                }
                @keyframes slideUp {
                    from { transform: translateY(40px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .popup-close-btn:hover {
                    transform: rotate(90deg) scale(1.1) !important;
                    background: rgba(0,0,0,0.15) !important;
                }
                .popup-action-btn:active {
                    transform: scale(0.98) !important;
                }
            `}</style>
        </div>
    );
};

export default DynamicPopup;
