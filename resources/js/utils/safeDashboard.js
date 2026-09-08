/**
 * Safe Dashboard Script - React Compatible
 * This version checks for element existence before initializing charts
 */

import { safeInitChart, checkLibrariesLoaded } from '../utils/chartUtils.js';

// Chart configuration options
const conversionsChartOptions = {
    chart: {
        height: 292,
        type: "radialBar"
    },
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
                name: {
                    fontSize: "14px",
                    color: "undefined",
                    offsetY: 100
                },
                value: {
                    offsetY: 55,
                    fontSize: "20px",
                    color: void 0,
                    formatter: function(e) {
                        return e + "%"
                    }
                }
            },
            track: {
                background: "rgba(170,184,197, 0.2)",
                margin: 0
            }
        }
    },
    fill: {
        gradient: {
            enabled: true,
            shade: "dark",
            shadeIntensity: 0.2,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 65, 91]
        }
    },
    stroke: {
        dashArray: 4
    },
    colors: ["#1bb394", "#1bb394"],
    series: [65.2],
    labels: ["Returning Customer"],
    responsive: [{
        breakpoint: 380,
        options: {
            chart: {
                height: 180
            }
        }
    }],
    grid: {
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    }
};

const performanceChartOptions = {
    series: [{
        name: "Page Views",
        type: "bar",
        data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67]
    }, {
        name: "Clicks",
        type: "area",
        data: [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35]
    }],
    chart: {
        height: 313,
        type: "line",
        toolbar: {
            show: false
        }
    },
    stroke: {
        dashArray: [0, 0],
        width: [0, 2],
        curve: "smooth"
    },
    fill: {
        opacity: [1, 1],
        type: ["solid", "gradient"],
        gradient: {
            type: "vertical",
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 90]
        }
    },
    markers: {
        size: [0, 0],
        strokeWidth: 2,
        hover: {
            size: 4
        }
    },
    xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        axisTicks: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        min: 0,
        axisBorder: {
            show: false
        }
    },
    grid: {
        show: true,
        strokeDashArray: 3,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: true
            }
        },
        padding: {
            top: 0,
            right: -2,
            bottom: 0,
            left: 10
        }
    },
    legend: {
        show: true,
        horizontalAlign: "center",
        offsetX: 0,
        offsetY: 5,
        markers: {
            width: 9,
            height: 9,
            radius: 6
        },
        itemMargin: {
            horizontal: 10,
            vertical: 0
        }
    },
    plotOptions: {
        bar: {
            columnWidth: "30%",
            barHeight: "70%",
            borderRadius: 3
        }
    },
    colors: ["#1bb394", "#1e84c4"],
    tooltip: {
        shared: true,
        y: [{
            formatter: function(e) {
                return void 0 !== e ? e.toFixed(1) + "k" : e
            }
        }, {
            formatter: function(e) {
                return void 0 !== e ? e.toFixed(1) + "k" : e
            }
        }]
    }
};

const vectorMapOptions = {
    map: "world",
    selector: "#world-map-markers",
    zoomOnScroll: true,
    zoomButtons: false,
    markersSelectable: true,
    markers: [{
        name: "Canada",
        coords: [56.1304, -106.3468]
    }, {
        name: "Brazil",
        coords: [-14.235, -51.9253]
    }, {
        name: "Russia",
        coords: [61, 105]
    }, {
        name: "China",
        coords: [35.8617, 104.1954]
    }, {
        name: "United States",
        coords: [37.0902, -95.7129]
    }],
    markerStyle: {
        initial: {
            fill: "#7f56da"
        },
        selected: {
            fill: "#1bb394"
        }
    },
    labels: {
        markers: {
            render: e => e.name
        }
    },
    regionStyle: {
        initial: {
            fill: "rgba(169,183,197, 0.3)",
            fillOpacity: 1
        }
    }
};

class SafeDashboard {
    constructor() {
        this.charts = {};
    }

    initConversionsChart() {
        return safeInitChart(
            "#conversions",
            (element) => {
                if (typeof ApexCharts !== 'undefined') {
                    const chart = new ApexCharts(element, conversionsChartOptions);
                    chart.render();
                    return chart;
                }
                throw new Error('ApexCharts library not loaded');
            },
            "Conversions Chart"
        );
    }

    initPerformanceChart() {
        return safeInitChart(
            "#dash-performance-chart",
            (element) => {
                if (typeof ApexCharts !== 'undefined') {
                    const chart = new ApexCharts(element, performanceChartOptions);
                    chart.render();
                    return chart;
                }
                throw new Error('ApexCharts library not loaded');
            },
            "Performance Chart"
        );
    }

    initWorldMapMarker() {
        return safeInitChart(
            "#world-map-markers",
            (element) => {
                if (typeof jsVectorMap !== 'undefined') {
                    return new jsVectorMap(vectorMapOptions);
                }
                throw new Error('jsVectorMap library not loaded');
            },
            "World Map"
        );
    }

    init() {
        // Check if required libraries are loaded
        if (!checkLibrariesLoaded(['ApexCharts', 'jsVectorMap'])) {
            console.warn('Some chart libraries are not loaded. Charts may not initialize properly.');
        }

        // Initialize charts safely
        this.charts.conversions = this.initConversionsChart();
        this.charts.performance = this.initPerformanceChart();
        this.charts.worldMap = this.initWorldMapMarker();
    }

    destroy() {
        // Clean up charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Auto-initialize when DOM is ready, but only if running in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    let dashboardInstance = null;

    const initDashboard = () => {
        if (dashboardInstance) {
            dashboardInstance.destroy();
        }
        dashboardInstance = new SafeDashboard();
        dashboardInstance.init();
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        // DOM is already ready
        initDashboard();
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (dashboardInstance) {
            dashboardInstance.destroy();
        }
    });
}

export default SafeDashboard;
