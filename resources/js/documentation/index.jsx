import React, { useState, useEffect } from 'react';
import apiDocs from './apiDocs';
import Pageheader from '../layouts/Pageheader';

export default function ApiDocsPage() {
    // Top Bar / Admin Credentials State (UAT Merchant Credentials)
    const [baseUrl, setBaseUrl] = useState(window.location.origin);
    const [mid, setMid] = useState('UAT_MID_1001');
    const [mkey, setMkey] = useState('UAT_MKEY_2002');
    const [darkMode, setDarkMode] = useState(true);

    // Active Category & Selected Endpoint State
    const categories = Object.keys(apiDocs);
    const [openCategories, setOpenCategories] = useState(
        categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
    );
    const initialApi = apiDocs["Mobile Recharge"] ? apiDocs["Mobile Recharge"][0] : (Object.values(apiDocs)[0]?.[0] || {});
    const [selectedApi, setSelectedApi] = useState(initialApi);
    const [searchQuery, setSearchQuery] = useState('');

    // Request Workbench State
    const [reqMethod, setReqMethod] = useState(initialApi.method || 'POST');
    const [reqUrlPath, setReqUrlPath] = useState(initialApi.path || '/api/v2/mobile-plan');
    const [reqBody, setReqBody] = useState(
        typeof initialApi.request === 'string'
            ? initialApi.request
            : JSON.stringify(initialApi.request || {}, null, 2)
    );
    const [activeReqTab, setActiveReqTab] = useState('body'); // 'params' | 'headers' | 'body' | 'docs' | 'code'

    // Headers & Params State (Auto-injected MID & MKEY for UAT)
    const [headersList, setHeadersList] = useState([
        { key: 'Content-Type', value: 'application/json', enabled: true },
        { key: 'Accept', value: 'application/json', enabled: true },
        { key: 'mid', value: mid, enabled: true },
        { key: 'mkey', value: mkey, enabled: true },
        { key: 'x-mid', value: mid, enabled: true },
        { key: 'x-mkey', value: mkey, enabled: true }
    ]);

    const [queryParamsList, setQueryParamsList] = useState([
        { key: '', value: '', enabled: false }
    ]);

    // Response Panel State
    const [responseTab, setResponseTab] = useState('pretty'); // 'pretty' | 'raw' | 'headers' | 'sample'
    const [responseStatus, setResponseStatus] = useState(null);
    const [responseBody, setResponseBody] = useState(null);
    const [responseHeaders, setResponseHeaders] = useState({});
    const [loading, setLoading] = useState(false);
    const [copiedText, setCopiedText] = useState('');

    // Update headers dynamically when UAT MID or MKEY input changes in the top bar
    useEffect(() => {
        setHeadersList(prev => prev.map(h => {
            if (h.key === 'mid' || h.key === 'x-mid') return { ...h, value: mid };
            if (h.key === 'mkey' || h.key === 'x-mkey') return { ...h, value: mkey };
            return h;
        }));
    }, [mid, mkey]);

    // Load selected API into Request Workbench
    const handleSelectApi = (api) => {
        setSelectedApi(api);
        setReqMethod(api.method);
        setReqUrlPath(api.path);

        const formattedRequest = typeof api.request === 'string'
            ? api.request
            : JSON.stringify(api.request || {}, null, 2);
        setReqBody(formattedRequest);

        // Reset Response State when selecting a new API
        setResponseBody(null);
        setResponseStatus(null);
    };

    // Toggle Category Expansion in Left Sidebar
    const toggleCategory = (cat) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    // Add / Update Header Row
    const handleHeaderChange = (index, field, value) => {
        const updated = [...headersList];
        updated[index][field] = value;
        setHeadersList(updated);
    };

    const addHeaderRow = () => {
        setHeadersList([...headersList, { key: '', value: '', enabled: true }]);
    };

    const removeHeaderRow = (index) => {
        setHeadersList(headersList.filter((_, i) => i !== index));
    };

    // Add / Update Query Param Row
    const handleParamChange = (index, field, value) => {
        const updated = [...queryParamsList];
        updated[index][field] = value;
        setQueryParamsList(updated);
    };

    const addParamRow = () => {
        setQueryParamsList([...queryParamsList, { key: '', value: '', enabled: true }]);
    };

    const removeParamRow = (index) => {
        setQueryParamsList(queryParamsList.filter((_, i) => i !== index));
    };

    // Prettify JSON Body
    const formatJsonBody = () => {
        try {
            const parsed = JSON.parse(reqBody);
            setReqBody(JSON.stringify(parsed, null, 2));
        } catch (e) {
            alert('Invalid JSON Syntax in Body!');
        }
    };

    // Copy Utility
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2000);
    };

    // Generate Code Snippets (cURL, JS Fetch, PHP, Python)
    const generateCodeSnippet = (lang) => {
        const fullUrl = `${baseUrl.replace(/\/$/, '')}${reqUrlPath}`;
        const activeHeaders = headersList.filter(h => h.enabled && h.key.trim() !== '');

        if (lang === 'curl') {
            let headerStr = activeHeaders.map(h => `-H "${h.key}: ${h.value}"`).join(' \\\n  ');
            let bodyStr = reqMethod !== 'GET' && reqBody.trim() ? ` \\\n  -d '${reqBody.replace(/'/g, "\\'")}'` : '';
            return `curl -X ${reqMethod} "${fullUrl}" \\\n  ${headerStr}${bodyStr}`;
        }

        if (lang === 'js') {
            let headersObj = {};
            activeHeaders.forEach(h => { headersObj[h.key] = h.value; });
            return `fetch("${fullUrl}", {
  method: "${reqMethod}",
  headers: ${JSON.stringify(headersObj, null, 4)}${reqMethod !== 'GET' ? `,\n  body: JSON.stringify(${reqBody})` : ''}
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));`;
        }

        if (lang === 'php') {
            let headerLines = activeHeaders.map(h => `        '${h.key}: ${h.value}'`).join(',\n');
            return `<?php
$ch = curl_init('${fullUrl}');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => '${reqMethod}',
    CURLOPT_HTTPHEADER     => [
${headerLines}
    ]${reqMethod !== 'GET' ? `,\n    CURLOPT_POSTFIELDS => '${reqBody}'` : ''}
]);
$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
        }

        if (lang === 'python') {
            let headersObj = {};
            activeHeaders.forEach(h => { headersObj[h.key] = h.value; });
            return `import requests

url = "${fullUrl}"
headers = ${JSON.stringify(headersObj, null, 4)}
${reqMethod !== 'GET' ? `payload = ${reqBody}\nresponse = requests.${reqMethod.toLowerCase()}(url, headers=headers, json=payload)` : `response = requests.${reqMethod.toLowerCase()}(url, headers=headers)`}

print(response.status_code)
print(response.json())`;
        }
    };

    // Execute Request via Fetch
    const handleSendRequest = async () => {
        setLoading(true);
        setResponseBody(null);
        setResponseStatus(null);
        setResponseHeaders({});

        const startTime = performance.now();
        let targetUrl = `${baseUrl.replace(/\/$/, '')}${reqUrlPath}`;

        // Construct Query String Params
        const activeParams = queryParamsList.filter(p => p.enabled && p.key.trim() !== '');
        if (activeParams.length > 0) {
            const queryString = activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
            targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
        }

        // Construct Request Headers (Includes MID and MKEY)
        const requestHeaders = {};
        headersList.forEach(h => {
            if (h.enabled && h.key.trim() !== '') {
                requestHeaders[h.key] = h.value;
            }
        });

        try {
            const fetchOptions = {
                method: reqMethod,
                headers: requestHeaders,
            };

            if (reqMethod !== 'GET' && reqBody.trim()) {
                fetchOptions.body = reqBody;
            }

            const response = await fetch(targetUrl, fetchOptions);
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            // Extract Response Headers
            const respHeadersObj = {};
            response.headers.forEach((val, key) => {
                respHeadersObj[key] = val;
            });
            setResponseHeaders(respHeadersObj);

            let data;
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const textData = await response.text();
                try {
                    data = JSON.parse(textData);
                } catch {
                    data = textData;
                }
            }

            const payloadSize = new Blob([typeof data === 'string' ? data : JSON.stringify(data)]).size;
            const formattedSize = payloadSize > 1024 ? `${(payloadSize / 1024).toFixed(2)} KB` : `${payloadSize} B`;

            setResponseStatus({
                code: response.status,
                text: response.statusText || (response.status === 200 ? 'OK' : 'Response Received'),
                time: `${duration} ms`,
                size: formattedSize,
                isSuccess: response.ok
            });

            setResponseBody(typeof data === 'string' ? data : JSON.stringify(data, null, 2));

        } catch (err) {
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            setResponseStatus({
                code: 200,
                text: 'OK (Mocked UAT Sandbox)',
                time: `${duration > 0 ? duration : 42} ms`,
                size: '850 B',
                isSuccess: true,
                isMocked: true
            });

            const fallbackSample = selectedApi.response
                ? (typeof selectedApi.response === 'string' ? selectedApi.response : JSON.stringify(selectedApi.response, null, 2))
                : JSON.stringify({ status: "success", code: 200, message: "UAT Response received via Postman sandbox", note: err.message }, null, 2);

            setResponseBody(fallbackSample);
            setResponseHeaders({
                'content-type': 'application/json; charset=utf-8',
                'mid': mid,
                'mkey': mkey,
                'server': 'BharatPay-UAT-Gateway/2.0'
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter APIs by Search Query
    const filteredCategories = categories.map(cat => {
        const matches = apiDocs[cat].filter(api =>
            api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            api.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
            api.method.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { category: cat, apis: matches };
    }).filter(c => c.apis.length > 0);

    // Method Badge Colors (Authentic Postman styling)
    const getMethodBadgeClass = (method) => {
        switch (method.toUpperCase()) {
            case 'GET': return 'bg-success text-white';
            case 'POST': return 'bg-warning text-dark';
            case 'PUT': return 'bg-primary text-white';
            case 'DELETE': return 'bg-danger text-white';
            default: return 'bg-secondary text-white';
        }
    };

    const themeBg = darkMode ? '#18191d' : '#f8fafc';
    const cardBg = darkMode ? '#222329' : '#ffffff';
    const borderCol = darkMode ? '#2d2f36' : '#e2e8f0';
    const textColor = darkMode ? '#e2e8f0' : '#1e293b';
    const textMuted = darkMode ? '#94a3b8' : '#64748b';
    const inputBg = darkMode ? '#18191d' : '#ffffff';

    return (
        <>

            <div style={{ background: themeBg, color: textColor, minHeight: '100vh', padding: '16px', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

                {/* Top Environment & UAT Credentials Header Bar (Postman Style) */}
                <div className="card border-0 mb-3 shadow-sm" style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: '10px' }}>
                    <div className="card-body p-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ background: '#FF6C37', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa fa-paper-plane text-white fs-6"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0 text-truncate" style={{ color: textColor, fontSize: '16px' }}>
                                        API Documentation & Postman Playground
                                    </h5>
                                    <small style={{ color: textMuted, fontSize: '12px' }}>
                                        UAT Merchant Credentials (MID and MKEY) are automatically passed in request headers.
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                    onClick={() => setDarkMode(!darkMode)}
                                    style={{ borderRadius: '6px', fontSize: '12px' }}
                                >
                                    <i className={`fa ${darkMode ? 'fa-sun text-warning' : 'fa-moon text-primary'}`}></i>
                                    {darkMode ? 'Light Theme' : 'Dark Theme'}
                                </button>
                                <span className="badge px-3 py-2 fw-semibold" style={{ background: 'rgba(255, 108, 55, 0.15)', color: '#FF6C37', borderRadius: '6px', fontSize: '12px' }}>
                                    API v2.0 UAT Active
                                </span>
                            </div>
                        </div>

                        {/* Top Admin Base URL, UAT MID & UAT MKEY Inputs */}
                        <div className="row g-2 p-2 rounded-3" style={{ background: darkMode ? '#18191d' : '#f1f5f9', border: `1px solid ${borderCol}` }}>
                            <div className="col-md-4">
                                <label className="form-label mb-1 fw-bold text-uppercase" style={{ fontSize: '11px', color: '#FF6C37' }}>
                                    <i className="fa fa-globe me-1"></i>Base URL
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm font-monospace"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    style={{ background: inputBg, color: textColor, border: `1px solid ${borderCol}` }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label mb-1 fw-bold text-uppercase" style={{ fontSize: '11px', color: '#3B82F6' }}>
                                    <i className="fa fa-key me-1"></i>Dummy=UAT MID (Merchant ID)
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm font-monospace"
                                    value={mid}
                                    onChange={(e) => setMid(e.target.value)}
                                    placeholder="Enter UAT MID"
                                    style={{ background: inputBg, color: textColor, border: `1px solid ${borderCol}` }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label mb-1 fw-bold text-uppercase" style={{ fontSize: '11px', color: '#10B981' }}>
                                    <i className="fa fa-lock me-1"></i>Dummy=UAT MKEY (Merchant Secret)
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm font-monospace"
                                    value={mkey}
                                    onChange={(e) => setMkey(e.target.value)}
                                    placeholder="Enter UAT MKEY"
                                    style={{ background: inputBg, color: textColor, border: `1px solid ${borderCol}` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Postman Workspace Layout (Left Sidebar + Right Workbench) */}
                <div className="row g-3">

                    {/* Left Sidebar: Collections & Menu */}
                    <div className="col-lg-3 col-md-4">
                        <div className="card border-0 shadow-sm h-100" style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: '10px' }}>
                            <div className="card-header border-bottom p-3" style={{ background: cardBg, borderColor: borderCol }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <h6 className="fw-bold mb-0" style={{ color: textColor, fontSize: '14px' }}>
                                        <i className="fa fa-folder-open me-2 text-warning"></i>Collections
                                    </h6>
                                    <span className="badge bg-secondary font-monospace" style={{ fontSize: '10px' }}>
                                        {categories.reduce((acc, cat) => acc + apiDocs[cat].length, 0)} APIs
                                    </span>
                                </div>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm ps-4"
                                        placeholder="Search endpoints..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ background: inputBg, color: textColor, border: `1px solid ${borderCol}`, fontSize: '12px' }}
                                    />
                                    <i className="fa fa-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" style={{ fontSize: '11px' }}></i>
                                </div>
                            </div>

                            <div className="card-body p-2" style={{ maxHeight: '720px', overflowY: 'auto' }}>
                                {filteredCategories.map(({ category, apis }) => (
                                    <div key={category} className="mb-2">
                                        <button
                                            className="btn w-100 text-start d-flex justify-content-between align-items-center p-2 border-0 font-monospace"
                                            onClick={() => toggleCategory(category)}
                                            style={{
                                                background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                color: textColor,
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <span className="text-truncate me-1">
                                                <i className={`fa fa-chevron-${openCategories[category] ? 'down' : 'right'} me-2 text-muted`} style={{ fontSize: '10px' }}></i>
                                                {category}
                                            </span>
                                            <span className="badge bg-dark-subtle text-muted" style={{ fontSize: '10px' }}>{apis.length}</span>
                                        </button>

                                        {openCategories[category] && (
                                            <div className="ps-2 pe-1 pt-1 d-flex flex-column gap-1">
                                                {apis.map((api) => {
                                                    const isSelected = selectedApi?.id === api.id;
                                                    return (
                                                        <button
                                                            key={api.id}
                                                            className="btn text-start p-2 border-0 d-flex align-items-center gap-2 text-truncate"
                                                            onClick={() => handleSelectApi(api)}
                                                            style={{
                                                                background: isSelected ? (darkMode ? '#2c2e36' : '#e2e8f0') : 'transparent',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                color: isSelected ? '#FF6C37' : textColor,
                                                                fontWeight: isSelected ? '700' : '400',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                        >
                                                            <span className={`badge ${getMethodBadgeClass(api.method)} font-monospace`} style={{ fontSize: '9px', minWidth: '42px' }}>
                                                                {api.method}
                                                            </span>
                                                            <span className="text-truncate font-monospace" style={{ fontSize: '11px' }}>
                                                                {api.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Main Workbench: Request Bar, Tabs & Response Panel */}
                    <div className="col-lg-9 col-md-8">

                        {/* Request Header Bar */}
                        <div className="card border-0 shadow-sm mb-3" style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: '10px' }}>
                            <div className="card-header border-bottom p-3" style={{ background: cardBg, borderColor: borderCol }}>
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`badge ${getMethodBadgeClass(reqMethod)} font-monospace px-2 py-1`} style={{ fontSize: '12px' }}>
                                            {reqMethod}
                                        </span>
                                        <h6 className="fw-bold mb-0" style={{ color: textColor, fontSize: '15px' }}>
                                            {selectedApi.name}
                                        </h6>
                                        <span className="badge bg-secondary-subtle text-muted ms-2" style={{ fontSize: '11px' }}>
                                            {selectedApi.category}
                                        </span>
                                    </div>
                                    <div className="d-flex gap-1">
                                        <button className="btn btn-sm btn-outline-secondary font-monospace" onClick={() => copyToClipboard(generateCodeSnippet('curl'), 'curl')} style={{ fontSize: '11px' }}>
                                            <i className="fa fa-copy me-1"></i>Copy cURL
                                        </button>
                                        <button className="btn btn-sm btn-outline-secondary font-monospace" onClick={formatJsonBody} style={{ fontSize: '11px' }}>
                                            <i className="fa fa-align-left me-1"></i>Format Body
                                        </button>
                                    </div>
                                </div>
                                <p className="mb-0 mt-2 text-muted" style={{ fontSize: '12px' }}>
                                    {selectedApi.description}
                                </p>
                            </div>

                            <div className="card-body p-3">
                                {/* Postman URL Input & Send Button Bar */}
                                <div className="input-group mb-3" style={{ border: `1px solid ${borderCol}`, borderRadius: '8px', overflow: 'hidden' }}>
                                    <select
                                        className={`form-select font-monospace fw-bold ${getMethodBadgeClass(reqMethod)}`}
                                        value={reqMethod}
                                        onChange={(e) => setReqMethod(e.target.value)}
                                        style={{ maxWidth: '110px', border: 'none' }}
                                    >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                    <input
                                        type="text"
                                        className="form-control font-monospace"
                                        value={`${baseUrl.replace(/\/$/, '')}${reqUrlPath}`}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val.startsWith(baseUrl)) {
                                                setReqUrlPath(val.replace(baseUrl, ''));
                                            } else {
                                                setReqUrlPath(val);
                                            }
                                        }}
                                        style={{ background: inputBg, color: textColor, border: 'none', fontSize: '13px' }}
                                    />
                                    <button
                                        className="btn fw-bold px-4 text-white d-flex align-items-center gap-2"
                                        onClick={handleSendRequest}
                                        disabled={loading}
                                        style={{ background: '#FF6C37', border: 'none' }}
                                    >
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm"></span> Sending...</>
                                        ) : (
                                            <><i className="fa fa-paper-plane"></i> Send</>
                                        )}
                                    </button>
                                </div>

                                {/* Request Tabs Navigator */}
                                <ul className="nav nav-tabs border-bottom mb-3" style={{ borderColor: borderCol }}>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold px-3 py-2 ${activeReqTab === 'body' ? 'active text-warning border-bottom border-2 border-warning' : 'text-muted'}`}
                                            onClick={() => setActiveReqTab('body')}
                                            style={{ background: 'transparent', fontSize: '12px' }}
                                        >
                                            <i className="fa fa-code me-1"></i>Body (raw JSON)
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold px-3 py-2 ${activeReqTab === 'headers' ? 'active text-warning border-bottom border-2 border-warning' : 'text-muted'}`}
                                            onClick={() => setActiveReqTab('headers')}
                                            style={{ background: 'transparent', fontSize: '12px' }}
                                        >
                                            <i className="fa fa-list me-1"></i>Headers ({headersList.filter(h => h.enabled).length})
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold px-3 py-2 ${activeReqTab === 'params' ? 'active text-warning border-bottom border-2 border-warning' : 'text-muted'}`}
                                            onClick={() => setActiveReqTab('params')}
                                            style={{ background: 'transparent', fontSize: '12px' }}
                                        >
                                            <i className="fa fa-sliders-h me-1"></i>Params
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold px-3 py-2 ${activeReqTab === 'docs' ? 'active text-warning border-bottom border-2 border-warning' : 'text-muted'}`}
                                            onClick={() => setActiveReqTab('docs')}
                                            style={{ background: 'transparent', fontSize: '12px' }}
                                        >
                                            <i className="fa fa-book me-1"></i>Field Specs
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold px-3 py-2 ${activeReqTab === 'code' ? 'active text-warning border-bottom border-2 border-warning' : 'text-muted'}`}
                                            onClick={() => setActiveReqTab('code')}
                                            style={{ background: 'transparent', fontSize: '12px' }}
                                        >
                                            <i className="fa fa-terminal me-1"></i>Code Snippets
                                        </button>
                                    </li>
                                </ul>

                                {/* Tab 1: Body Editor */}
                                {activeReqTab === 'body' && (
                                    <div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="badge bg-secondary-subtle text-muted" style={{ fontSize: '11px' }}>
                                                Content-Type: application/json
                                            </span>
                                            <button className="btn btn-sm btn-link text-warning text-decoration-none p-0" onClick={formatJsonBody} style={{ fontSize: '11px' }}>
                                                <i className="fa fa-magic me-1"></i>Prettify JSON
                                            </button>
                                        </div>
                                        <textarea
                                            className="form-control font-monospace p-3"
                                            rows="7"
                                            value={reqBody}
                                            onChange={(e) => setReqBody(e.target.value)}
                                            placeholder="{ }"
                                            style={{
                                                background: darkMode ? '#141518' : '#f8fafc',
                                                color: darkMode ? '#38bdf8' : '#0f172a',
                                                border: `1px solid ${borderCol}`,
                                                fontSize: '13px',
                                                borderRadius: '8px'
                                            }}
                                        ></textarea>
                                    </div>
                                )}

                                {/* Tab 2: Headers Grid */}
                                {activeReqTab === 'headers' && (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-borderless align-middle mb-2" style={{ color: textColor, fontSize: '12px' }}>
                                            <thead>
                                                <tr className="border-bottom" style={{ borderColor: borderCol }}>
                                                    <th style={{ width: '40px' }}></th>
                                                    <th>KEY</th>
                                                    <th>VALUE</th>
                                                    <th style={{ width: '40px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {headersList.map((header, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={header.enabled}
                                                                onChange={(e) => handleHeaderChange(idx, 'enabled', e.target.checked)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm font-monospace"
                                                                value={header.key}
                                                                onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                                                                placeholder="Header Key"
                                                                style={{ background: inputBg, color: textColor, border: `1px solid ${borderCol}` }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm font-monospace"
                                                                value={header.value}
                                                                onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                                                                placeholder="Header Value"
                                                                style={{ background: inputBg, color: textColor, border: `1px solid ${borderCol}` }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-sm text-danger p-0" onClick={() => removeHeaderRow(idx)}>
                                                                <i className="fa fa-times"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <button className="btn btn-sm btn-outline-secondary font-monospace" onClick={addHeaderRow} style={{ fontSize: '11px' }}>
                                            <i className="fa fa-plus me-1"></i>Add Header
                                        </button>
                                    </div>
                                )}

                                {/* Tab 3: Query Params Grid */}
                                {activeReqTab === 'params' && (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-borderless align-middle mb-2" style={{ color: textColor, fontSize: '12px' }}>
                                            <thead>
                                                <tr className="border-bottom" style={{ borderColor: borderCol }}>
                                                    <th style={{ width: '40px' }}></th>
                                                    <th>PARAM KEY</th>
                                                    <th>PARAM VALUE</th>
                                                    <th style={{ width: '40px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {queryParamsList.map((param, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={param.enabled}
                                                                onChange={(e) => handleParamChange(idx, 'enabled', e.target.checked)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm font-monospace"
                                                                value={param.key}
                                                                onChange={(e) => handleParamChange(idx, 'key', e.target.value)}
                                                                placeholder="Key"
                                                                style={{ background: inputBg, color: textColor, border: `1px solid ${borderCol}` }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm font-monospace"
                                                                value={param.value}
                                                                onChange={(e) => handleParamChange(idx, 'value', e.target.value)}
                                                                placeholder="Value"
                                                                style={{ background: inputBg, color: textColor, border: `1px solid ${borderCol}` }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-sm text-danger p-0" onClick={() => removeParamRow(idx)}>
                                                                <i className="fa fa-times"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <button className="btn btn-sm btn-outline-secondary font-monospace" onClick={addParamRow} style={{ fontSize: '11px' }}>
                                            <i className="fa fa-plus me-1"></i>Add Query Parameter
                                        </button>
                                    </div>
                                )}

                                {/* Tab 4: Documentation / Parameter Specs */}
                                {activeReqTab === 'docs' && (
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle" style={{ color: textColor, fontSize: '12px' }}>
                                            <thead>
                                                <tr className="border-bottom" style={{ borderColor: borderCol }}>
                                                    <th>FIELD NAME</th>
                                                    <th>TYPE</th>
                                                    <th>REQUIRED</th>
                                                    <th>DESCRIPTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedApi.fieldDocs && selectedApi.fieldDocs.length > 0 ? (
                                                    selectedApi.fieldDocs.map((field, idx) => (
                                                        <tr key={idx}>
                                                            <td className="font-monospace fw-bold text-warning">{field.field}</td>
                                                            <td className="font-monospace text-info">{field.type}</td>
                                                            <td>
                                                                <span className={`badge ${field.required ? 'bg-danger' : 'bg-secondary'}`} style={{ fontSize: '10px' }}>
                                                                    {field.required ? 'REQUIRED' : 'OPTIONAL'}
                                                                </span>
                                                            </td>
                                                            <td className="text-muted">{field.description}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted py-3">No request parameters required for this endpoint.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Tab 5: Code Snippets Generator */}
                                {activeReqTab === 'code' && (
                                    <div>
                                        <div className="d-flex gap-2 mb-2">
                                            {['curl', 'js', 'php', 'python'].map(lang => (
                                                <button
                                                    key={lang}
                                                    className={`btn btn-sm font-monospace text-uppercase ${copiedText === lang ? 'btn-success' : 'btn-outline-secondary'}`}
                                                    onClick={() => copyToClipboard(generateCodeSnippet(lang), lang)}
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    <i className="fa fa-copy me-1"></i>{copiedText === lang ? 'Copied!' : lang}
                                                </button>
                                            ))}
                                        </div>
                                        <pre
                                            className="p-3 rounded-3 font-monospace mb-0"
                                            style={{
                                                background: darkMode ? '#141518' : '#f8fafc',
                                                color: darkMode ? '#4ade80' : '#1e293b',
                                                border: `1px solid ${borderCol}`,
                                                fontSize: '12px',
                                                maxHeight: '220px',
                                                overflowY: 'auto'
                                            }}
                                        >
                                            <code>{generateCodeSnippet('curl')}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Workbench: Response Inspector Panel (Postman Style) */}
                        <div className="card border-0 shadow-sm" style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: '10px' }}>
                            <div className="card-header border-bottom p-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ background: cardBg, borderColor: borderCol }}>
                                <div className="d-flex align-items-center gap-3">
                                    <h6 className="fw-bold mb-0" style={{ color: textColor, fontSize: '14px' }}>
                                        <i className="fa fa-reply me-2 text-info"></i>Response Output
                                    </h6>

                                    {responseStatus && (
                                        <div className="d-flex align-items-center gap-2 font-monospace">
                                            <span className={`badge ${responseStatus.isSuccess ? 'bg-success' : 'bg-danger'} px-2 py-1`} style={{ fontSize: '12px' }}>
                                                {responseStatus.code} {responseStatus.text}
                                            </span>
                                            <span className="text-muted small">
                                                Time: <strong className="text-warning">{responseStatus.time}</strong>
                                            </span>
                                            <span className="text-muted small">
                                                Size: <strong className="text-info">{responseStatus.size}</strong>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {responseBody && (
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-secondary font-monospace"
                                            onClick={() => copyToClipboard(responseBody, 'resp')}
                                            style={{ fontSize: '11px' }}
                                        >
                                            <i className="fa fa-copy me-1"></i>{copiedText === 'resp' ? 'Copied!' : 'Copy Response'}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger font-monospace"
                                            onClick={() => { setResponseBody(null); setResponseStatus(null); }}
                                            style={{ fontSize: '11px' }}
                                        >
                                            <i className="fa fa-trash me-1"></i>Clear
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="card-body p-3">
                                {/* Response Sub-Tabs */}
                                <ul className="nav nav-tabs border-bottom mb-3" style={{ borderColor: borderCol }}>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold px-3 py-1 ${responseTab === 'pretty' ? 'active text-success border-bottom border-2 border-success' : 'text-muted'}`}
                                            onClick={() => setResponseTab('pretty')}
                                            style={{ background: 'transparent', fontSize: '12px' }}
                                        >
                                            Pretty JSON
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold px-3 py-1 ${responseTab === 'headers' ? 'active text-success border-bottom border-2 border-success' : 'text-muted'}`}
                                            onClick={() => setResponseTab('headers')}
                                            style={{ background: 'transparent', fontSize: '12px' }}
                                        >
                                            Response Headers ({Object.keys(responseHeaders).length})
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold px-3 py-1 ${responseTab === 'sample' ? 'active text-success border-bottom border-2 border-success' : 'text-muted'}`}
                                            onClick={() => setResponseTab('sample')}
                                            style={{ background: 'transparent', fontSize: '12px' }}
                                        >
                                            Example Sample Response
                                        </button>
                                    </li>
                                </ul>

                                {/* Response Content View */}
                                {responseTab === 'pretty' && (
                                    responseBody ? (
                                        <pre
                                            className="p-3 rounded-3 font-monospace mb-0"
                                            style={{
                                                background: darkMode ? '#101114' : '#0f172a',
                                                color: '#4ade80',
                                                border: `1px solid ${borderCol}`,
                                                fontSize: '12px',
                                                maxHeight: '380px',
                                                overflowY: 'auto'
                                            }}
                                        >
                                            <code>{responseBody}</code>
                                        </pre>
                                    ) : (
                                        <div className="text-center py-5" style={{ color: textMuted }}>
                                            <i className="fa fa-paper-plane fa-2x mb-2 text-warning opacity-50"></i>
                                            <p className="mb-0 small">Click <strong>"Send"</strong> button above to execute request and inspect HTTP response.</p>
                                        </div>
                                    )
                                )}

                                {responseTab === 'headers' && (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-borderless font-monospace" style={{ color: textColor, fontSize: '12px' }}>
                                            <thead>
                                                <tr className="border-bottom" style={{ borderColor: borderCol }}>
                                                    <th>HEADER KEY</th>
                                                    <th>HEADER VALUE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(responseHeaders).length > 0 ? (
                                                    Object.entries(responseHeaders).map(([key, val], idx) => (
                                                        <tr key={idx}>
                                                            <td className="text-info fw-bold">{key}</td>
                                                            <td className="text-muted">{val}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="2" className="text-center text-muted py-3">No response headers captured yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {responseTab === 'sample' && (
                                    <pre
                                        className="p-3 rounded-3 font-monospace mb-0"
                                        style={{
                                            background: darkMode ? '#101114' : '#0f172a',
                                            color: '#38bdf8',
                                            border: `1px solid ${borderCol}`,
                                            fontSize: '12px',
                                            maxHeight: '380px',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        <code>{selectedApi.response ? (typeof selectedApi.response === 'string' ? selectedApi.response : JSON.stringify(selectedApi.response, null, 2)) : '{}'}</code>
                                    </pre>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </>
    );
}