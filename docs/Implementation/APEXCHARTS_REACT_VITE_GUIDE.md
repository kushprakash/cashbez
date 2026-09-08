 ApexCharts with React + Vite - Complete Guide (2024-2025)

## 🚀 Modern Setup & Installation

### 1. Install Required Packages
```bash
npm install apexcharts react-apexcharts
```

### 2. Modern Import Pattern (Recommended)
```jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';

// Dynamic import for better performance
const SafeChart = ({ type, height, options, series }) => {
    const [Chart, setChart] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadChart = async () => {
            try {
                const { default: ReactApexChart } = await import('react-apexcharts');
                setChart(() => ReactApexChart);
                setLoading(false);
            } catch (error) {
                console.warn('Chart loading failed:', error);
                setLoading(false);
            }
        };
        
        loadChart();
    }, []);
    
    if (loading) return <div>Loading chart...</div>;
    if (!Chart) return <div>Chart unavailable</div>;
    
    return <Chart options={options} series={series} type={type} height={height} />;
};
```

## 📊 Chart Type Examples

### Line Chart (Smooth & Modern)
```jsx
<SafeChart
  type="line"
  height={350}
  options={{
    chart: { 
      id: "modern-line",
      toolbar: { show: false },
      fontFamily: "'Inter', sans-serif"
    },
    colors: ['#1F78FF'],
    stroke: { 
      curve: 'smooth', 
      width: 3 
    },
    markers: { 
      size: 6,
      hover: { size: 8 }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 3
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: { style: { colors: '#7B8A99' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#7B8A99' },
        formatter: (val) => `₹${val}K`
      }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => `₹${val.toLocaleString()}` }
    }
  }}
  series={[{
    name: 'Revenue',
    data: [30, 40, 35, 50, 49, 60]
  }]}
/>
```

### Area Chart with Gradient
```jsx
<SafeChart
  type="area"
  height={300}
  options={{
    chart: { toolbar: { show: false } },
    colors: ['#27AE60'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] }
  }}
  series={[{
    name: 'Growth',
    data: [31, 40, 28, 51]
  }]}
/>
```

### Modern Bar Chart
```jsx
<SafeChart
  type="bar"
  height={350}
  options={{
    chart: { toolbar: { show: false } },
    colors: ['#8B5CF6'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        dataLabels: { position: 'top' }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `₹${val}K`,
      offsetY: -20,
      style: { colors: ['#2E3B4E'] }
    },
    xaxis: { categories: ['Product A', 'Product B', 'Product C', 'Product D'] }
  }}
  series={[{
    name: 'Sales',
    data: [44, 55, 41, 67]
  }]}
/>
```

### Donut Chart with Custom Labels
```jsx
<SafeChart
  type="donut"
  height={300}
  options={{
    labels: ['Mobile', 'Desktop', 'Tablet'],
    colors: ['#1F78FF', '#27AE60', '#F2C94C'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Users',
              formatter: () => '12,450'
            }
          }
        }
      }
    },
    legend: { position: 'bottom' },
    responsive: [{
      breakpoint: 768,
      options: { legend: { position: 'bottom' } }
    }]
  }}
  series={[60, 30, 10]}
/>
```

### Radial Progress Chart
```jsx
<SafeChart
  type="radialBar"
  height={250}
  options={{
    plotOptions: {
      radialBar: {
        hollow: { size: '60%' },
        dataLabels: {
          name: { 
            fontSize: '16px',
            color: '#2E3B4E'
          },
          value: { 
            fontSize: '24px',
            color: '#1F78FF',
            formatter: (val) => `${val}%`
          }
        }
      }
    },
    colors: ['#1F78FF'],
    labels: ['Success Rate']
  }}
  series={[85]}
/>
```

### Mixed Chart (Column + Line)
```jsx
<SafeChart
  type="line"
  height={350}
  options={{
    chart: { toolbar: { show: false } },
    colors: ['#8B5CF6', '#1F78FF'],
    stroke: { width: [0, 4] },
    plotOptions: {
      bar: { columnWidth: '50%' }
    },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    legend: { position: 'top' }
  }}
  series={[
    { 
      name: 'Revenue', 
      type: 'column', 
      data: [23, 34, 45, 32, 54, 41] 
    },
    { 
      name: 'Profit', 
      type: 'line', 
      data: [44, 55, 41, 67, 22, 43] 
    }
  ]}
/>
```

## 🎨 Modern Styling & Themes

### Dark Theme
```jsx
const darkThemeOptions = {
  theme: { mode: 'dark' },
  chart: {
    background: '#1a1a1a',
    foreColor: '#ffffff'
  },
  grid: {
    borderColor: '#333333'
  }
};
```

### Custom Colors (Banking Theme)
```jsx
const bankingColors = {
  primary: '#1F78FF',
  success: '#27AE60',
  warning: '#F2C94C',
  danger: '#EB5757',
  info: '#8B5CF6',
  light: '#F7F9FB',
  dark: '#2E3B4E'
};
```

## 📱 Responsive Configuration

```jsx
const responsiveOptions = {
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: { width: "100%" },
        legend: { position: 'bottom' },
        plotOptions: {
          bar: { horizontal: true }
        }
      }
    },
    {
      breakpoint: 480,
      options: {
        chart: { height: 250 },
        legend: { show: false }
      }
    }
  ]
};
```

## 🔄 Real-time Data Updates

```jsx
const RealTimeChart = () => {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch new data
      fetchLatestData().then(newData => {
        setChartData(prev => [...prev.slice(-10), newData]);
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <SafeChart
      type="line"
      series={[{ name: 'Live Data', data: chartData }]}
      options={{
        chart: { animations: { enabled: true } },
        xaxis: { type: 'datetime' }
      }}
    />
  );
};
```

## 🛡️ Error Handling & Loading States

```jsx
const SafeChart = ({ type, height, options, series }) => {
  const [state, setState] = useState({
    Chart: null,
    loading: true,
    error: false
  });
  
  useEffect(() => {
    import('react-apexcharts')
      .then(module => {
        setState({
          Chart: module.default,
          loading: false,
          error: false
        });
      })
      .catch(() => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: true
        }));
      });
  }, []);
  
  if (state.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (state.error) {
    return (
      <div className="alert alert-warning text-center" style={{ height }}>
        <i className="bi bi-exclamation-triangle"></i>
        <p>Chart temporarily unavailable</p>
      </div>
    );
  }
  
  return <state.Chart options={options} series={series} type={type} height={height} />;
};
```

## ⚡ Performance Optimization

### 1. Lazy Loading
```jsx
const ChartComponent = React.lazy(() => import('./SafeChart'));

<Suspense fallback={<ChartSkeleton />}>
  <ChartComponent {...chartProps} />
</Suspense>
```

### 2. Memoization
```jsx
const MemoizedChart = React.memo(({ data }) => {
  const chartOptions = useMemo(() => ({
    // Chart configuration
  }), [data]);
  
  return <SafeChart options={chartOptions} />;
});
```

### 3. Data Validation
```jsx
const validateChartData = (series) => {
  return series && 
    Array.isArray(series) && 
    series.length > 0 &&
    series.every(s => s.data && Array.isArray(s.data));
};
```

## 🎯 Banking-Specific Examples

### Transaction Volume Chart
```jsx
<SafeChart
  type="area"
  options={{
    colors: ['#1F78FF'],
    fill: { type: 'gradient' },
    yaxis: {
      labels: {
        formatter: (val) => `₹${(val/1000).toFixed(0)}K`
      }
    },
    tooltip: {
      y: { formatter: (val) => `₹${val.toLocaleString()}` }
    }
  }}
  series={[{
    name: 'Transaction Volume',
    data: [2400, 1398, 9800, 3908, 4800, 3800]
  }]}
/>
```

### Success Rate Gauge
```jsx
<SafeChart
  type="radialBar"
  options={{
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        dataLabels: {
          value: { formatter: (val) => `${val}%` }
        }
      }
    },
    colors: ['#27AE60']
  }}
  series={[92]}
/>
```

## 🔧 Vite-Specific Configuration

### vite.config.js
```js
export default defineConfig({
  optimizeDeps: {
    include: ['apexcharts', 'react-apexcharts']
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Keep ApexCharts in main bundle for better performance
        return false;
      }
    }
  }
});
```

## 📚 Best Practices Summary

1. **Always use dynamic imports** for better performance
2. **Implement proper error boundaries** and loading states
3. **Validate data** before passing to charts
4. **Use consistent color schemes** across your application
5. **Make charts responsive** for all device sizes
6. **Format data properly** (currency, numbers, dates)
7. **Add meaningful tooltips** and labels
8. **Optimize for performance** with memoization
9. **Handle real-time updates** efficiently
10. **Test on different screen sizes** and browsers

This guide covers modern patterns for 2024-2025 and ensures your charts are performant, accessible, and user-friendly!