import React, { useEffect, useRef, useState } from 'react';
import { safeInitChart } from '../utils/chartUtils';

/**
 * React component for ApexCharts integration
 */
const ApexChart = ({ 
    type = 'line', 
    options = {}, 
    series = [], 
    height = 350,
    width = '100%',
    className = '',
    onChartReady = null 
}) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        const initChart = () => {
            if (!chartRef.current) return;
            
            // Check if ApexCharts is available
            if (typeof window.ApexCharts === 'undefined') {
                setError('ApexCharts library is not loaded');
                return;
            }

            try {
                // Clean up existing chart
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                const chartOptions = {
                    chart: {
                        type,
                        height,
                        width,
                        ...options.chart
                    },
                    series,
                    ...options
                };

                chartInstanceRef.current = new window.ApexCharts(chartRef.current, chartOptions);
                
                chartInstanceRef.current.render().then(() => {
                    if (mounted) {
                        setIsLoaded(true);
                        setError(null);
                        if (onChartReady && typeof onChartReady === 'function') {
                            onChartReady(chartInstanceRef.current);
                        }
                    }
                }).catch(err => {
                    if (mounted) {
                        setError(`Failed to render chart: ${err.message}`);
                    }
                });

            } catch (err) {
                if (mounted) {
                    setError(`Failed to initialize chart: ${err.message}`);
                }
            }
        };

        initChart();

        return () => {
            mounted = false;
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [type, options, series, height, width]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, []);

    if (error) {
        return (
            <div className={`chart-error ${className}`} style={{ height, width }}>
                <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center">
                        <i className="fas fa-chart-line text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted mb-0">Chart Error</p>
                        <small className="text-danger">{error}</small>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`apex-chart ${className}`}>
            <div 
                ref={chartRef} 
                style={{ height, width }}
            />
            {!isLoaded && (
                <div className="chart-loading position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading chart...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApexChart;
