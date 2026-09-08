import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const availableServiceList = [
    'Prepaid', 'DTH', 'Postpaid', 'Landline', 'Broadband', 'Electricity',
    'LPG Booking', 'Piped Gas', 'Cable TV', 'Fastag', 'Insurance', 'Water',
    'Finance', 'Gift Cards'
];

const dynamicValueOptions = [
    { label: 'Static Value (Custom Value in Docs)', value: 'Static Value' },
    { label: 'Mobile Number', value: 'number' },
    { label: 'Customer Mobile Number', value: 'customer_number' },
    { label: 'Recharge Amount', value: 'amount' },
    { label: 'Operator Code', value: 'operator' },
    { label: 'Circle Code', value: 'circle' },
    { label: 'Transaction ID / TxnId', value: 'txnid' },
    { label: 'Reference ID (oid)', value: 'oid' },
    { label: 'Account Number / Customer ID', value: 'account_number' },
    { label: 'Callback URL', value: 'call_back_url' },
    { label: 'User ID / Member ID', value: 'user_id' },
    { label: 'Agent Code / Merchant ID', value: 'agent_code' },
    { label: 'GEOCode (Lat,Long Float 4 Digits)', value: 'geocode' },
    { label: 'Latitude (Lat)', value: 'latitude' },
    { label: 'Longitude (Long)', value: 'longitude' },
    { label: 'Pincode (Area Pin)', value: 'pincode' },
    { label: 'Outlet ID / Merchant Outlet ID', value: 'outletid' },
    { label: 'Client IP Address', value: 'client_ip' },
    { label: 'Timestamp (Unix)', value: 'timestamp' },
    { label: 'Random Reference ID', value: 'random_ref' },
    { label: 'API Key / Password', value: 'api_key' },
    { label: 'Recharge Date (YYYY-MM-DD)', value: 'recharge_date' },
    { label: 'Recharge Date (DD-MM-YYYY)', value: 'date_dmy' },
    { label: 'Recharge Date (DD/MM/YYYY)', value: 'date_dmy_slash' },
    { label: 'Created At (YYYY-MM-DD HH:mm:ss)', value: 'created_at' },
];

const ApiSettingForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const apiService = ApiService();

    // Accordion open/collapse states
    const [openAccordions, setOpenAccordions] = useState({
        recharge: true,    // Open by default
        statusCheck: false,
        balance: false,
        callback: false
    });

    const toggleAccordion = (sec) => {
        setOpenAccordions(prev => ({ ...prev, [sec]: !prev[sec] }));
    };

    // Form State
    const [basic, setBasic] = useState({
        api_name: '',
        api_short_name: '',
        ip_address: '164.52.220.21',
        only_fetch_bill: 'NO'
    });

    const [selectedServices, setSelectedServices] = useState([]);

    const [balanceAlerts, setBalanceAlerts] = useState({
        first: '',
        second: '',
        third: ''
    });

    // Recharge Config
    const [rechargeConfig, setRechargeConfig] = useState({
        url: '',
        request_type: 'GET',
        params: [{ key: '', dynamic_value: 'Static Value', value: '' }],
        response_type: 'JSON',
        key_for_status: '',
        result_success: '',
        result_failure: '',
        supplier_id_key: '',
        supplier_id_result: '',
        opr_txn_id_key: '',
        opr_txn_id_result: '',
        balance_id_key: '',
        balance_id_result: '',
        available_keys: ['status', 'STATUS', 'resText', 'orderId', 'txnid', 'operator', 'balance', 'message', 'Message']
    });

    // Status Check Config
    const [statusConfig, setStatusConfig] = useState({
        url: '',
        request_type: 'GET',
        params: [{ key: '', dynamic_value: 'Static Value', value: '' }],
        response_type: 'JSON',
        key_for_status: '',
        result_success: '',
        result_failure: '',
        supplier_id_key: '',
        supplier_id_result: '',
        opr_txn_id_key: '',
        opr_txn_id_result: '',
        available_keys: ['status', 'STATUS', 'resText', 'orderId', 'txnid', 'operator', 'balance', 'message', 'Message']
    });

    // Balance Config
    const [balanceConfig, setBalanceConfig] = useState({
        url: '',
        request_type: 'GET',
        params: [{ key: '', value: '' }],
        response_type: 'JSON',
        key_for_status: '',
        result_success: '',
        result_failure: '',
        balance_id_key: '',
        balance_id_result: '',
        available_keys: ['status', 'STATUS', 'balance', 'Balance', 'data.balance']
    });

    // Callback Config
    const [callbackConfig, setCallbackConfig] = useState({
        api_name: '',
        txn_id_key: '',
        supplier_txn_id_key: '',
        opr_txn_id_key: '',
        status_key: '',
        result_success: '',
        result_failure: '',
        balance_key: ''
    });

    const [availableServices, setAvailableServices] = useState(availableServiceList);
    const [loading, setLoading] = useState(false);
    const [fetchingApi, setFetchingApi] = useState({ recharge: false, status: false, balance: false });

    // Fetch available service categories from bbps_category table
    const fetchServiceCategories = async () => {
        try {
            const response = await apiService.vGet('/api/service-categories');
            if (response.data && response.data.status === 1 && Array.isArray(response.data.data)) {
                setAvailableServices(response.data.data);
            }
        } catch (error) {
            // Keep fallback list
        }
    };

    // Fetch existing API Setting if editing & service categories
    useEffect(() => {
        fetchServiceCategories();
        if (isEdit) {
            fetchApiSetting();
        }
    }, [id]);

    const fetchApiSetting = async () => {
        setLoading(true);
        try {
            const response = await apiService.vGet(`/api/api-settings/${id}`);
            if (response.data && response.data.status === 1) {
                const item = response.data.data;
                setBasic({
                    api_name: item.api_name || '',
                    api_short_name: item.api_short_name || '',
                    ip_address: item.ip_address || '164.52.220.21',
                    only_fetch_bill: item.only_fetch_bill ? 'YES' : 'NO'
                });
                setSelectedServices(Array.isArray(item.services) ? item.services : []);
                setBalanceAlerts({
                    first: item.first_low_balance_alert || '',
                    second: item.second_low_balance_alert || '',
                    third: item.third_low_balance_alert || ''
                });

                if (item.recharge_config) setRechargeConfig(prev => ({ ...prev, ...item.recharge_config }));
                if (item.status_check_config) setStatusConfig(prev => ({ ...prev, ...item.status_check_config }));
                if (item.balance_config) setBalanceConfig(prev => ({ ...prev, ...item.balance_config }));
                if (item.callback_config) setCallbackConfig(prev => ({ ...prev, ...item.callback_config }));
            }
        } catch (error) {
            toast.error('Failed to load API setting data');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceToggle = (service) => {
        setSelectedServices(prev =>
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    // Helper for compiling dynamic preview URL
    const buildFinalUrl = (baseUrl, params) => {
        if (!baseUrl) return '';
        if (!Array.isArray(params) || params.length === 0) return baseUrl;

        const validPairs = params
            .filter(p => p.key && p.key.trim() !== '')
            .map(p => {
                const val = p.dynamic_value && p.dynamic_value !== 'Static Value'
                    ? `{${p.dynamic_value}}`
                    : (p.value || '');
                return `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(val)}`;
            });

        if (validPairs.length === 0) return baseUrl;
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}${validPairs.join('&')}`;
    };

    // Dynamic Parameter Table Handlers
    const handleParamChange = (configSetter, index, field, val) => {
        configSetter(prev => {
            const updated = [...prev.params];
            updated[index] = { ...updated[index], [field]: val };
            return { ...prev, params: updated };
        });
    };

    // Auto Extract GET parameters from URL into dynamic parameter table rows
    const handleUrlChangeWithAutoParams = (rawUrl, configSetter, hasDynamicValue = true) => {
        if (!rawUrl) {
            configSetter(prev => ({ ...prev, url: '' }));
            return;
        }

        // Check if URL has query parameters (contains '?')
        if (rawUrl.includes('?')) {
            const [baseUrl, queryString] = rawUrl.split('?');
            if (queryString && queryString.trim() !== '') {
                const searchParams = new URLSearchParams(queryString);
                const extractedParams = [];

                searchParams.forEach((val, key) => {
                    if (key && key.trim() !== '') {
                        const lowerKey = key.trim().toLowerCase();
                        let matchedDynamicValue = 'Static Value';

                        if (hasDynamicValue) {
                            if (['number', 'mobile', 'phone', 'ca_number', 'canumber'].includes(lowerKey)) matchedDynamicValue = 'number';
                            else if (['amount', 'amt', 'recharge_amount', 'rc_amount'].includes(lowerKey)) matchedDynamicValue = 'amount';
                            else if (['operator', 'opcode', 'op_code', 'operator_code', 'sp_key'].includes(lowerKey)) matchedDynamicValue = 'operator';
                            else if (['circle', 'circle_code', 'state'].includes(lowerKey)) matchedDynamicValue = 'circle';
                            else if (['txnid', 'txn_id', 'order_id', 'orderid'].includes(lowerKey)) matchedDynamicValue = 'txnid';
                            else if (['oid', 'refrence_id', 'reference_id', 'refid', 'referenceid'].includes(lowerKey)) matchedDynamicValue = 'refrence_id';
                            else if (['account_number', 'account', 'customer_id', 'consumer_id'].includes(lowerKey)) matchedDynamicValue = 'account_number';
                            else if (['call_back_url', 'callback_url', 'cburl'].includes(lowerKey)) matchedDynamicValue = 'call_back_url';
                            else if (['user_id', 'userid', 'member_id'].includes(lowerKey)) matchedDynamicValue = 'user_id';
                            else if (['api_key', 'apikey', 'password', 'pass'].includes(lowerKey)) matchedDynamicValue = 'api_key';

                            extractedParams.push({
                                key: key.trim(),
                                dynamic_value: matchedDynamicValue,
                                value: val || ''
                            });
                        } else {
                            extractedParams.push({
                                key: key.trim(),
                                value: val || ''
                            });
                        }
                    }
                });

                if (extractedParams.length > 0) {
                    configSetter(prev => ({
                        ...prev,
                        url: baseUrl,
                        params: extractedParams
                    }));
                    toast.info(`Auto-generated ${extractedParams.length} parameter(s) from URL!`);
                    return;
                }
            }
        }

        configSetter(prev => ({ ...prev, url: rawUrl }));
    };

    const addParamRow = (configSetter, hasDynamicValue = true) => {
        configSetter(prev => ({
            ...prev,
            params: [...prev.params, hasDynamicValue ? { key: '', dynamic_value: 'Static Value', value: '' } : { key: '', value: '' }]
        }));
    };

    const removeParamRow = (configSetter, index) => {
        configSetter(prev => ({
            ...prev,
            params: prev.params.filter((_, i) => i !== index)
        }));
    };

    // Fetch API schema response for dynamic keys & display raw JSON response
    const handleFetchApiTest = async (section, url, params, method = 'GET') => {
        if (!url) {
            toast.warning('Please enter Target URL before fetching API');
            return;
        }

        setFetchingApi(prev => ({ ...prev, [section]: true }));
        try {
            const response = await apiService.vPost('/api/api-settings/fetch-test-response', {
                url: url,
                method: method,
                params: params
            });

            if (response.data && response.data.status === 1) {
                toast.success('API response fetched successfully!');
                const keys = response.data.keys || [];
                const rawResp = response.data.raw_response;

                if (section === 'recharge') {
                    setRechargeConfig(prev => ({ ...prev, available_keys: keys, raw_response: rawResp }));
                } else if (section === 'status') {
                    setStatusConfig(prev => ({ ...prev, available_keys: keys, raw_response: rawResp }));
                } else if (section === 'balance') {
                    setBalanceConfig(prev => ({ ...prev, available_keys: keys, raw_response: rawResp }));
                }
            } else {
                toast.error(response.data?.message || 'Failed to fetch API response');
            }
        } catch (error) {
            toast.error('Error connecting to target API');
        } finally {
            setFetchingApi(prev => ({ ...prev, [section]: false }));
        }
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!basic.api_name.trim()) {
            toast.error('API Name is required');
            return;
        }
        if (!basic.api_short_name.trim()) {
            toast.error('API Short Name is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                api_name: basic.api_name,
                api_short_name: basic.api_short_name,
                ip_address: basic.ip_address,
                only_fetch_bill: basic.only_fetch_bill === 'YES',
                services: selectedServices,
                first_low_balance_alert: balanceAlerts.first,
                second_low_balance_alert: balanceAlerts.second,
                third_low_balance_alert: balanceAlerts.third,
                recharge_config: rechargeConfig,
                status_check_config: statusConfig,
                balance_config: balanceConfig,
                callback_config: callbackConfig
            };

            let response;
            if (isEdit) {
                response = await apiService.vPost(`/api/api-settings/${id}`, payload);
            } else {
                response = await apiService.vPost('/api/api-settings', payload);
            }

            if (response.data && response.data.status === 1) {
                toast.success(isEdit ? 'API Master updated successfully' : 'API Master created successfully');
                setTimeout(() => {
                    navigate('/api-master/setting/report');
                }, 1200);
            } else {
                toast.error(response.data?.message || 'Failed to save API Master setting');
            }
        } catch (error) {
            toast.error('Error saving API setting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Breadcrumb Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ color: '#4b5563', fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Apis / </span>
                        <span className="text-secondary fw-bold">{isEdit ? 'Edit API' : 'Add API'}</span>
                    </h5>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/api-master/setting/report')}
                        className="btn px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#6c5ce7',
                            borderColor: '#6c5ce7',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-list"></i> API REPORT
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>

                {/* ============================================================ */}
                {/* 1. ALWAYS OPEN: API's Basic Details */}
                {/* ============================================================ */}
                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                    <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem', color: '#374151' }}>
                            API's Basic Details
                        </h6>
                        <span className="text-muted small">Api Details</span>
                    </div>

                    <div className="card-body p-4">
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <label className="form-label text-secondary small fw-medium">
                                    API Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder=""
                                    value={basic.api_name}
                                    onChange={(e) => setBasic(prev => ({ ...prev, api_name: e.target.value }))}
                                    required
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label text-secondary small fw-medium">
                                    API Short Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder=""
                                    value={basic.api_short_name}
                                    onChange={(e) => setBasic(prev => ({ ...prev, api_short_name: e.target.value }))}
                                    required
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label text-secondary small fw-medium">IP ADDRESS</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-light"
                                    placeholder="164.52.220.21"
                                    value={basic.ip_address}
                                    onChange={(e) => setBasic(prev => ({ ...prev, ip_address: e.target.value }))}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label text-secondary small fw-medium">Only Fetch Bill</label>
                                <select
                                    className="form-select form-select-lg"
                                    value={basic.only_fetch_bill}
                                    onChange={(e) => setBasic(prev => ({ ...prev, only_fetch_bill: e.target.value }))}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                >
                                    <option value="NO">NO</option>
                                    <option value="YES">YES</option>
                                </select>
                            </div>
                        </div>

                        {/* Available Services Section */}
                        <div className="border-top pt-3 mt-3">
                            <div className="text-center text-muted small fw-bold mb-3" style={{ letterSpacing: '0.5px' }}>
                                Available Services
                            </div>
                            <div className="row g-3">
                                {availableServices.map((service, idx) => (
                                    <div key={idx} className="col-lg-2 col-md-3 col-6">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`service_${idx}`}
                                                checked={selectedServices.includes(service)}
                                                onChange={() => handleServiceToggle(service)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label
                                                className="form-check-label text-secondary small fw-medium"
                                                htmlFor={`service_${idx}`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {service}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 2. ALWAYS OPEN: Low Balance Alert Settings */}
                {/* ============================================================ */}
                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                    <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem', color: '#374151' }}>
                            Low Balance Alert Settings
                        </h6>
                        <span className="text-muted small">Balance Settings</span>
                    </div>

                    <div className="card-body p-4">
                        <div className="row g-4">
                            <div className="col-md-4">
                                <label className="form-label text-secondary small fw-medium">First Low Balance Alert</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Eg: 1,00,000"
                                    value={balanceAlerts.first}
                                    onChange={(e) => setBalanceAlerts(prev => ({ ...prev, first: e.target.value }))}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label text-secondary small fw-medium">Second Low Balance Alert</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Eg: 50,000"
                                    value={balanceAlerts.second}
                                    onChange={(e) => setBalanceAlerts(prev => ({ ...prev, second: e.target.value }))}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label text-secondary small fw-medium">Third Low Balance Alert</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Eg: 10,000"
                                    value={balanceAlerts.third}
                                    onChange={(e) => setBalanceAlerts(prev => ({ ...prev, third: e.target.value }))}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* 3. ACCORDION 1: Configure Recharge API */}
                {/* ============================================================ */}
                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                    <div
                        className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center"
                        onClick={() => toggleAccordion('recharge')}
                        style={{ cursor: 'pointer' }}
                    >
                        <h6 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                            <i className="fas fa-chart-line text-primary"></i> Configure Recharge API
                        </h6>
                        <i className={`fas fa-chevron-${openAccordions.recharge ? 'up' : 'down'} text-muted`}></i>
                    </div>

                    {openAccordions.recharge && (
                        <div className="card-body p-4 pt-0">
                            <div className="row g-4">
                                {/* Left Box: REQUEST CONFIGURATION */}
                                <div className="col-lg-6">
                                    <div className="border border-primary border-opacity-50 rounded-4 p-4 h-100 bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: '0.875rem', letterSpacing: '0.5px' }}>
                                                REQUEST CONFIGURATION
                                            </h6>
                                            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>CONFIGURATION API</small>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-8">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Recharge url"
                                                    value={rechargeConfig.url}
                                                    onChange={(e) => handleUrlChangeWithAutoParams(e.target.value, setRechargeConfig, true)}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <select
                                                    className="form-select"
                                                    value={rechargeConfig.request_type}
                                                    onChange={(e) => setRechargeConfig(prev => ({ ...prev, request_type: e.target.value }))}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                >
                                                    <option value="GET">GET</option>
                                                    <option value="POST JSON">POST JSON</option>
                                                    <option value="POST FormData">POST FormData</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Dynamic Parameters Table */}
                                        <div className="table-responsive mb-3">
                                            <table className="table align-middle border mb-0" style={{ fontSize: '0.8rem' }}>
                                                <thead className="table-light">
                                                    <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                                                        <th>SR NO</th>
                                                        <th>PARAM NAME</th>
                                                        <th>DYNAMIC VALUE</th>
                                                        <th>STATIC VALUE</th>
                                                        <th className="text-center">ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rechargeConfig.params.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Key"
                                                                    value={p.key}
                                                                    onChange={(e) => handleParamChange(setRechargeConfig, idx, 'key', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={p.dynamic_value}
                                                                    onChange={(e) => handleParamChange(setRechargeConfig, idx, 'dynamic_value', e.target.value)}
                                                                >
                                                                    {dynamicValueOptions.map((opt, i) => (
                                                                        <option key={i} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Value"
                                                                    value={p.value}
                                                                    onChange={(e) => handleParamChange(setRechargeConfig, idx, 'value', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger p-1 px-2"
                                                                    onClick={() => removeParamRow(setRechargeConfig, idx)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="d-flex justify-content-end mb-3">
                                            <button
                                                type="button"
                                                className="btn btn-sm text-white fw-bold px-3"
                                                style={{ backgroundColor: '#6366f1', borderRadius: '6px' }}
                                                onClick={() => addParamRow(setRechargeConfig)}
                                            >
                                                + ADD MORE
                                            </button>
                                        </div>

                                        {/* Final URL Preview */}
                                        <div>
                                            <small className="text-secondary fw-semibold d-block mb-1">Final URL</small>
                                            <div
                                                className="p-2 rounded text-white fw-medium overflow-auto"
                                                style={{ backgroundColor: '#6366f1', fontSize: '0.8rem', minHeight: '38px', wordBreak: 'break-all' }}
                                            >
                                                {buildFinalUrl(rechargeConfig.url, rechargeConfig.params) || 'URL will appear here'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Box: RESPONSE CONFIGURATION */}
                                <div className="col-lg-6">
                                    <div className="border border-success border-opacity-50 rounded-4 p-4 h-100 bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: '0.875rem', letterSpacing: '0.5px' }}>
                                                RESPONSE CONFIGURATION
                                            </h6>
                                            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>RESPONSE</small>
                                        </div>

                                        <div className="row g-3 mb-3 align-items-center">
                                            <div className="col-7">
                                                <label className="form-label text-secondary small fw-medium mb-1">Response Type</label>
                                                <select
                                                    className="form-select"
                                                    value={rechargeConfig.response_type}
                                                    onChange={(e) => setRechargeConfig(prev => ({ ...prev, response_type: e.target.value }))}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                >
                                                    <option value="JSON">JSON</option>
                                                    <option value="XML">XML</option>
                                                    <option value="Text">Text</option>
                                                </select>
                                            </div>
                                            <div className="col-5 pt-3">
                                                <button
                                                    type="button"
                                                    className="btn text-white fw-bold w-100 py-2"
                                                    style={{ backgroundColor: '#6366f1', borderRadius: '6px', fontSize: '0.8rem' }}
                                                    disabled={fetchingApi.recharge}
                                                    onClick={() => handleFetchApiTest('recharge', rechargeConfig.url, rechargeConfig.params, rechargeConfig.request_type)}
                                                >
                                                    {fetchingApi.recharge ? 'FETCHING...' : 'FETCH API'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-center text-muted small border-top border-bottom py-1 my-3">
                                            Response Received
                                        </div>

                                        {rechargeConfig.raw_response && (
                                            <div className="mb-3">
                                                <small className="text-success fw-bold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                                                    <i className="fas fa-check-circle me-1"></i> Live Response (JSON):
                                                </small>
                                                <pre className="p-2 rounded border bg-dark text-warning fw-monospace overflow-auto" style={{ maxHeight: '160px', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {(() => {
                                                        try {
                                                            return JSON.stringify(typeof rechargeConfig.raw_response === 'string' ? JSON.parse(rechargeConfig.raw_response) : rechargeConfig.raw_response, null, 2);
                                                        } catch (e) {
                                                            return rechargeConfig.raw_response;
                                                        }
                                                    })()}
                                                </pre>
                                            </div>
                                        )}

                                        {/* Key For Status */}
                                        <div className="mb-3">
                                            <small className="text-muted fw-semibold d-block mb-1">Key For Status</small>
                                            <div className="row g-2">
                                                <div className="col-5">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={rechargeConfig.key_for_status}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, key_for_status: e.target.value }))}
                                                    >
                                                        <option value="">Select Key</option>
                                                        {rechargeConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result Success (e.g. Success, 1)"
                                                        value={rechargeConfig.result_success}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, result_success: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result Failure (e.g. Failure, Error, 0)"
                                                        value={rechargeConfig.result_failure}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, result_failure: e.target.value }))}
                                                    />
                                                    <div className="text-muted mt-1" style={{ fontSize: '0.68rem' }}>
                                                        Use comma (",") for multiple values (e.g. Failure, Error)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Keys For Supplier */}
                                        <div className="mb-3 border-top pt-2">
                                            <small className="text-muted fw-semibold d-block mb-1">Keys For Supplier</small>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={rechargeConfig.supplier_id_key}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, supplier_id_key: e.target.value }))}
                                                    >
                                                        <option value="">Supplier ID Key</option>
                                                        {rechargeConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result"
                                                        value={rechargeConfig.supplier_id_result}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, supplier_id_result: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Keys For Opr Txn Id */}
                                        <div className="mb-3 border-top pt-2">
                                            <small className="text-muted fw-semibold d-block mb-1">Keys For Opr Txn Id</small>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={rechargeConfig.opr_txn_id_key}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, opr_txn_id_key: e.target.value }))}
                                                    >
                                                        <option value="">Opr Txn Id Key</option>
                                                        {rechargeConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result"
                                                        value={rechargeConfig.opr_txn_id_result}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, opr_txn_id_result: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Key / Position For Balance */}
                                        <div className="border-top pt-2">
                                            <small className="text-muted fw-semibold d-block mb-1">Key / Position For Balance</small>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={rechargeConfig.balance_id_key}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, balance_id_key: e.target.value }))}
                                                    >
                                                        <option value="">Balance ID Key</option>
                                                        {rechargeConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result"
                                                        value={rechargeConfig.balance_id_result}
                                                        onChange={(e) => setRechargeConfig(prev => ({ ...prev, balance_id_result: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* 4. ACCORDION 2: Configure Status Check API */}
                {/* ============================================================ */}
                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                    <div
                        className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center"
                        onClick={() => toggleAccordion('statusCheck')}
                        style={{ cursor: 'pointer' }}
                    >
                        <h6 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                            <i className="fas fa-random text-primary"></i> Configure Status Check API
                        </h6>
                        <i className={`fas fa-chevron-${openAccordions.statusCheck ? 'up' : 'down'} text-muted`}></i>
                    </div>

                    {openAccordions.statusCheck && (
                        <div className="card-body p-4 pt-0">
                            <div className="row g-4">
                                {/* Left Box */}
                                <div className="col-lg-6">
                                    <div className="border border-primary border-opacity-50 rounded-4 p-4 h-100 bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: '0.875rem' }}>REQUEST CONFIGURATION</h6>
                                            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>CONFIGURATION API</small>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-8">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Balance URL / Status URL"
                                                    value={statusConfig.url}
                                                    onChange={(e) => handleUrlChangeWithAutoParams(e.target.value, setStatusConfig, true)}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <select
                                                    className="form-select"
                                                    value={statusConfig.request_type}
                                                    onChange={(e) => setStatusConfig(prev => ({ ...prev, request_type: e.target.value }))}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                >
                                                    <option value="GET">GET</option>
                                                    <option value="POST JSON">POST JSON</option>
                                                    <option value="POST FormData">POST FormData</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="table-responsive mb-3">
                                            <table className="table align-middle border mb-0" style={{ fontSize: '0.8rem' }}>
                                                <thead className="table-light">
                                                    <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                                                        <th>SR NO</th>
                                                        <th>PARAM NAME</th>
                                                        <th>DYNAMIC VALUE</th>
                                                        <th>STATIC VALUE</th>
                                                        <th className="text-center">ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {statusConfig.params.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Key"
                                                                    value={p.key}
                                                                    onChange={(e) => handleParamChange(setStatusConfig, idx, 'key', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={p.dynamic_value}
                                                                    onChange={(e) => handleParamChange(setStatusConfig, idx, 'dynamic_value', e.target.value)}
                                                                >
                                                                    {dynamicValueOptions.map((opt, i) => (
                                                                        <option key={i} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Value"
                                                                    value={p.value}
                                                                    onChange={(e) => handleParamChange(setStatusConfig, idx, 'value', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger p-1 px-2"
                                                                    onClick={() => removeParamRow(setStatusConfig, idx)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="d-flex justify-content-end mb-3">
                                            <button
                                                type="button"
                                                className="btn btn-sm text-white fw-bold px-3"
                                                style={{ backgroundColor: '#6366f1', borderRadius: '6px' }}
                                                onClick={() => addParamRow(setStatusConfig)}
                                            >
                                                + ADD MORE
                                            </button>
                                        </div>

                                        <div>
                                            <small className="text-secondary fw-semibold d-block mb-1">Final URL</small>
                                            <div
                                                className="p-2 rounded text-white fw-medium overflow-auto"
                                                style={{ backgroundColor: '#6366f1', fontSize: '0.8rem', minHeight: '38px', wordBreak: 'break-all' }}
                                            >
                                                {buildFinalUrl(statusConfig.url, statusConfig.params) || 'URL will appear here'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Box */}
                                <div className="col-lg-6">
                                    <div className="border border-success border-opacity-50 rounded-4 p-4 h-100 bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: '0.875rem' }}>RESPONSE CONFIGURATION</h6>
                                            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>RESPONSE</small>
                                        </div>

                                        <div className="row g-3 mb-3 align-items-center">
                                            <div className="col-7">
                                                <select
                                                    className="form-select"
                                                    value={statusConfig.response_type}
                                                    onChange={(e) => setStatusConfig(prev => ({ ...prev, response_type: e.target.value }))}
                                                >
                                                    <option value="JSON">JSON</option>
                                                    <option value="XML">XML</option>
                                                    <option value="Text">Text</option>
                                                </select>
                                            </div>
                                            <div className="col-5">
                                                <button
                                                    type="button"
                                                    className="btn text-white fw-bold w-100 py-2"
                                                    style={{ backgroundColor: '#6366f1', borderRadius: '6px', fontSize: '0.8rem' }}
                                                    disabled={fetchingApi.status}
                                                    onClick={() => handleFetchApiTest('status', statusConfig.url, statusConfig.params, statusConfig.request_type)}
                                                >
                                                    {fetchingApi.status ? 'FETCHING...' : 'FETCH API'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-center text-muted small border-top border-bottom py-1 my-3">Response Received</div>

                                        {statusConfig.raw_response && (
                                            <div className="mb-3">
                                                <small className="text-success fw-bold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                                                    <i className="fas fa-check-circle me-1"></i> Live Response (JSON):
                                                </small>
                                                <pre className="p-2 rounded border bg-dark text-warning fw-monospace overflow-auto" style={{ maxHeight: '160px', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {(() => {
                                                        try {
                                                            return JSON.stringify(typeof statusConfig.raw_response === 'string' ? JSON.parse(statusConfig.raw_response) : statusConfig.raw_response, null, 2);
                                                        } catch (e) {
                                                            return statusConfig.raw_response;
                                                        }
                                                    })()}
                                                </pre>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <small className="text-muted fw-semibold d-block mb-1">Key For Status</small>
                                            <div className="row g-2">
                                                <div className="col-5">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={statusConfig.key_for_status}
                                                        onChange={(e) => setStatusConfig(prev => ({ ...prev, key_for_status: e.target.value }))}
                                                    >
                                                        <option value="">Select</option>
                                                        {statusConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result Success (e.g. Success, 1)"
                                                        value={statusConfig.result_success}
                                                        onChange={(e) => setStatusConfig(prev => ({ ...prev, result_success: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result Failure (e.g. Failure, Error, 0)"
                                                        value={statusConfig.result_failure}
                                                        onChange={(e) => setStatusConfig(prev => ({ ...prev, result_failure: e.target.value }))}
                                                    />
                                                    <div className="text-muted mt-1" style={{ fontSize: '0.68rem' }}>
                                                        Use comma (",") for multiple values (e.g. Failure, Error)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3 border-top pt-2">
                                            <small className="text-muted fw-semibold d-block mb-1">Keys For Supplier</small>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={statusConfig.supplier_id_key}
                                                        onChange={(e) => setStatusConfig(prev => ({ ...prev, supplier_id_key: e.target.value }))}
                                                    >
                                                        <option value="">Select</option>
                                                        {statusConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result"
                                                        value={statusConfig.supplier_id_result}
                                                        onChange={(e) => setStatusConfig(prev => ({ ...prev, supplier_id_result: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-top pt-2">
                                            <small className="text-muted fw-semibold d-block mb-1">Keys For Opr Txn Id</small>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={statusConfig.opr_txn_id_key}
                                                        onChange={(e) => setStatusConfig(prev => ({ ...prev, opr_txn_id_key: e.target.value }))}
                                                    >
                                                        <option value="">Select</option>
                                                        {statusConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result"
                                                        value={statusConfig.opr_txn_id_result}
                                                        onChange={(e) => setStatusConfig(prev => ({ ...prev, opr_txn_id_result: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* 5. ACCORDION 3: Configure Balance API */}
                {/* ============================================================ */}
                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                    <div
                        className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center"
                        onClick={() => toggleAccordion('balance')}
                        style={{ cursor: 'pointer' }}
                    >
                        <h6 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                            <i className="fas fa-balance-scale text-primary"></i> Configure Balance API
                        </h6>
                        <i className={`fas fa-chevron-${openAccordions.balance ? 'up' : 'down'} text-muted`}></i>
                    </div>

                    {openAccordions.balance && (
                        <div className="card-body p-4 pt-0">
                            <div className="row g-4">
                                {/* Left Box */}
                                <div className="col-lg-6">
                                    <div className="border border-primary border-opacity-50 rounded-4 p-4 h-100 bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: '0.875rem' }}>REQUEST CONFIGURATION</h6>
                                            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>CONFIGURATION API</small>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-8">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Balance URL"
                                                    value={balanceConfig.url}
                                                    onChange={(e) => handleUrlChangeWithAutoParams(e.target.value, setBalanceConfig, false)}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <select
                                                    className="form-select"
                                                    value={balanceConfig.request_type}
                                                    onChange={(e) => setBalanceConfig(prev => ({ ...prev, request_type: e.target.value }))}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                >
                                                    <option value="GET">GET</option>
                                                    <option value="POST JSON">POST JSON</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="table-responsive mb-3">
                                            <table className="table align-middle border mb-0" style={{ fontSize: '0.8rem' }}>
                                                <thead className="table-light">
                                                    <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                                                        <th>SR NO</th>
                                                        <th>PARAM NAME</th>
                                                        <th>STATIC VALUE</th>
                                                        <th className="text-center">ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {balanceConfig.params.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Key"
                                                                    value={p.key}
                                                                    onChange={(e) => handleParamChange(setBalanceConfig, idx, 'key', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Value"
                                                                    value={p.value}
                                                                    onChange={(e) => handleParamChange(setBalanceConfig, idx, 'value', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger p-1 px-2"
                                                                    onClick={() => removeParamRow(setBalanceConfig, idx)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="d-flex justify-content-end mb-3">
                                            <button
                                                type="button"
                                                className="btn btn-sm text-white fw-bold px-3"
                                                style={{ backgroundColor: '#6366f1', borderRadius: '6px' }}
                                                onClick={() => addParamRow(setBalanceConfig, false)}
                                            >
                                                + ADD MORE
                                            </button>
                                        </div>

                                        <div>
                                            <small className="text-secondary fw-semibold d-block mb-1">Final URL</small>
                                            <div
                                                className="p-2 rounded text-white fw-medium overflow-auto"
                                                style={{ backgroundColor: '#6366f1', fontSize: '0.8rem', minHeight: '38px', wordBreak: 'break-all' }}
                                            >
                                                {buildFinalUrl(balanceConfig.url, balanceConfig.params) || 'URL will appear here'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Box */}
                                <div className="col-lg-6">
                                    <div className="border border-success border-opacity-50 rounded-4 p-4 h-100 bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: '0.875rem' }}>RESPONSE CONFIGURATION</h6>
                                            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>RESPONSE</small>
                                        </div>

                                        <div className="row g-3 mb-3 align-items-center">
                                            <div className="col-7">
                                                <select
                                                    className="form-select"
                                                    value={balanceConfig.response_type}
                                                    onChange={(e) => setBalanceConfig(prev => ({ ...prev, response_type: e.target.value }))}
                                                >
                                                    <option value="JSON">JSON</option>
                                                    <option value="XML">XML</option>
                                                </select>
                                            </div>
                                            <div className="col-5">
                                                <button
                                                    type="button"
                                                    className="btn text-white fw-bold w-100 py-2"
                                                    style={{ backgroundColor: '#6366f1', borderRadius: '6px', fontSize: '0.8rem' }}
                                                    disabled={fetchingApi.balance}
                                                    onClick={() => handleFetchApiTest('balance', balanceConfig.url, balanceConfig.params, balanceConfig.request_type)}
                                                >
                                                    {fetchingApi.balance ? 'FETCHING...' : 'FETCH API'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-center text-muted small border-top border-bottom py-1 my-3">Response Received</div>

                                        {balanceConfig.raw_response && (
                                            <div className="mb-3">
                                                <small className="text-success fw-bold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                                                    <i className="fas fa-check-circle me-1"></i> Live Response (JSON):
                                                </small>
                                                <pre className="p-2 rounded border bg-dark text-warning fw-monospace overflow-auto" style={{ maxHeight: '160px', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {(() => {
                                                        try {
                                                            return JSON.stringify(typeof balanceConfig.raw_response === 'string' ? JSON.parse(balanceConfig.raw_response) : balanceConfig.raw_response, null, 2);
                                                        } catch (e) {
                                                            return balanceConfig.raw_response;
                                                        }
                                                    })()}
                                                </pre>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <small className="text-muted fw-semibold d-block mb-1">Key For Status</small>
                                            <div className="row g-2">
                                                <div className="col-5">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={balanceConfig.key_for_status}
                                                        onChange={(e) => setBalanceConfig(prev => ({ ...prev, key_for_status: e.target.value }))}
                                                    >
                                                        <option value="">Select</option>
                                                        {balanceConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result Success (e.g. Success, 1)"
                                                        value={balanceConfig.result_success}
                                                        onChange={(e) => setBalanceConfig(prev => ({ ...prev, result_success: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Result Failure (e.g. Failure, Error, 0)"
                                                        value={balanceConfig.result_failure}
                                                        onChange={(e) => setBalanceConfig(prev => ({ ...prev, result_failure: e.target.value }))}
                                                    />
                                                    <div className="text-muted mt-1" style={{ fontSize: '0.68rem' }}>
                                                        Use comma (",") for multiple values (e.g. Failure, Error)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-top pt-2">
                                            <small className="text-muted fw-semibold d-block mb-1">Key / Position For Balance</small>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={balanceConfig.balance_id_key}
                                                        onChange={(e) => setBalanceConfig(prev => ({ ...prev, balance_id_key: e.target.value }))}
                                                    >
                                                        <option value="">Balance ID</option>
                                                        {balanceConfig.available_keys.map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Final Result Balance"
                                                        value={balanceConfig.balance_id_result}
                                                        onChange={(e) => setBalanceConfig(prev => ({ ...prev, balance_id_result: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* 6. ACCORDION 4: Callback API / Response URL */}
                {/* ============================================================ */}
                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                    <div
                        className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center"
                        onClick={() => toggleAccordion('callback')}
                        style={{ cursor: 'pointer' }}
                    >
                        <h6 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                            <i className="fas fa-balance-scale text-primary"></i> Callback API / Response URL
                        </h6>
                        <i className={`fas fa-chevron-${openAccordions.callback ? 'up' : 'down'} text-muted`}></i>
                    </div>

                    {openAccordions.callback && (
                        <div className="card-body p-4 pt-0">
                            <div className="border border-primary border-opacity-50 rounded-4 p-4 bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 className="fw-bold text-uppercase text-secondary mb-0" style={{ fontSize: '0.875rem' }}>CALLBACK</h6>
                                    <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>CALLBACK RESPONSE</small>
                                </div>

                                <div className="row g-4 mb-4 align-items-center">
                                    <div className="col-md-5">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="API Name"
                                            value={callbackConfig.api_name}
                                            onChange={(e) => setCallbackConfig(prev => ({ ...prev, api_name: e.target.value }))}
                                            style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                        />
                                    </div>
                                    <div className="col-md-7">
                                        <small className="text-secondary fw-semibold d-block">Final Callback URL</small>
                                        <a href="https://bbps.bharatpays.in/callback/recharge/" target="_blank" rel="noreferrer" className="text-primary fw-medium small" style={{ wordBreak: 'break-all' }}>
                                            https://bbps.bharatpays.in/callback/recharge/
                                        </a>
                                    </div>
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="TXN Id (Recharge Id)"
                                            value={callbackConfig.txn_id_key}
                                            onChange={(e) => setCallbackConfig(prev => ({ ...prev, txn_id_key: e.target.value }))}
                                            style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Supplier's TXN Id"
                                            value={callbackConfig.supplier_txn_id_key}
                                            onChange={(e) => setCallbackConfig(prev => ({ ...prev, supplier_txn_id_key: e.target.value }))}
                                            style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Operator's TXN Id"
                                            value={callbackConfig.opr_txn_id_key}
                                            onChange={(e) => setCallbackConfig(prev => ({ ...prev, opr_txn_id_key: e.target.value }))}
                                            style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Status Key"
                                            value={callbackConfig.status_key}
                                            onChange={(e) => setCallbackConfig(prev => ({ ...prev, status_key: e.target.value }))}
                                            style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Result Success (e.g. Success, 1)"
                                            value={callbackConfig.result_success}
                                            onChange={(e) => setCallbackConfig(prev => ({ ...prev, result_success: e.target.value }))}
                                            style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Result Failure (e.g. Failure, Error, 0)"
                                            value={callbackConfig.result_failure}
                                            onChange={(e) => setCallbackConfig(prev => ({ ...prev, result_failure: e.target.value }))}
                                            style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                        />
                                        <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                                            Use comma (",") for multiple values (e.g. Failure, Error)
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Balance Key"
                                            value={callbackConfig.balance_key}
                                            onChange={(e) => setCallbackConfig(prev => ({ ...prev, balance_key: e.target.value }))}
                                            style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit & Reset Buttons */}
                <div className="d-flex justify-content-center gap-3 pb-5">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn text-white fw-bold px-5 py-2 shadow-sm"
                        style={{
                            backgroundColor: '#6366f1',
                            borderColor: '#6366f1',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        {loading ? 'SAVING...' : 'SUBMIT'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/api-master/setting/report')}
                        className="btn text-white fw-bold px-5 py-2 shadow-sm"
                        style={{
                            backgroundColor: '#ff6b6b',
                            borderColor: '#ff6b6b',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        RESET
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ApiSettingForm;
