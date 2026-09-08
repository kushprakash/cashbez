import React, { useEffect, useRef, useState } from 'react';

/**
 * React component for jsVectorMap integration
 */
const VectorMap = ({
    map = 'world',
    markers = [],
    regions = {},
    backgroundColor = 'transparent',
    zoomButtons = false,
    zoomOnScroll = true,
    height = 350,
    width = '100%',
    className = '',
    onRegionClick = null,
    onMarkerClick = null,
    style = {},
    markerStyle = {
        initial: { fill: '#7f56da' },
        selected: { fill: '#1bb394' }
    },
    regionStyle = {
        initial: { 
            fill: 'rgba(169,183,197, 0.3)',
            fillOpacity: 1 
        }
    }
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        const initMap = () => {
            if (!mapRef.current) return;

            // Check if jsVectorMap is available
            if (typeof window.jsVectorMap === 'undefined') {
                setError('jsVectorMap library is not loaded');
                return;
            }

            try {
                // Clean up existing map
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.destroy();
                }

                const mapOptions = {
                    map,
                    selector: mapRef.current,
                    backgroundColor,
                    zoomButtons,
                    zoomOnScroll,
                    markers,
                    regions,
                    markerStyle,
                    regionStyle,
                    onRegionClick: (event, code) => {
                        if (onRegionClick && typeof onRegionClick === 'function') {
                            onRegionClick(event, code);
                        }
                    },
                    onMarkerClick: (event, index) => {
                        if (onMarkerClick && typeof onMarkerClick === 'function') {
                            onMarkerClick(event, index);
                        }
                    }
                };

                mapInstanceRef.current = new window.jsVectorMap(mapOptions);

                if (mounted) {
                    setIsLoaded(true);
                    setError(null);
                }

            } catch (err) {
                if (mounted) {
                    setError(`Failed to initialize map: ${err.message}`);
                }
            }
        };

        // Add a small delay to ensure the DOM element is properly mounted
        const timer = setTimeout(initMap, 100);

        return () => {
            mounted = false;
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.destroy();
                } catch (e) {
                    // Ignore destroy errors
                }
                mapInstanceRef.current = null;
            }
        };
    }, [map, markers, regions, backgroundColor, zoomButtons, zoomOnScroll]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.destroy();
                } catch (e) {
                    // Ignore destroy errors
                }
            }
        };
    }, []);

    if (error) {
        return (
            <div 
                className={`vector-map-error ${className}`} 
                style={{ height, width, ...style }}
            >
                <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center">
                        <i className="fas fa-globe text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted mb-0">Map Error</p>
                        <small className="text-danger">{error}</small>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`vector-map-container ${className}`} style={{ height, width, ...style }}>
            <div 
                ref={mapRef} 
                className="vector-map"
                style={{ height: '100%', width: '100%' }}
            />
            {!isLoaded && (
                <div className="map-loading position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading map...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VectorMap;
