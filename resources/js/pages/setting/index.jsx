import React, { useState, useEffect, useContext } from 'react';
import ApiService from '../../core/services/ApiService';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';
import { uploadToBunny } from '../../utils/BunnyUploadService';
import { AuthContext } from '../../core/hooks/context';

const SettingIndex = () => {
    const { id } = useParams();
    const { userData } = useContext(AuthContext);
    const isAdmin = userData && (userData.role == 1 || userData.id == 21);
    const [form, setForm] = useState({
        company_name: '',
        logo: null,
        footer_logo: null,
        favicon: null,
        about: '',
        copy_right: '',
        address: '',
        email: '',
        website: '',
        whatsapp_no: '',
        mobile_no: '',
        landline_no: '',
        map_url: '',
        meta_title: '',
        meta_keyword: '',
        meta_description: '',
        theme_color_primary: '#007bff',
        theme_color_secondary: '#6c757d',
        currency_code: 'USD',
        call_back_url: '',
        playstore_url: '',
        playstore_qr_img: null,
        // Mail Message Settings
        smtp_user: '',
        smtp_host: '',
        smtp_port: '',
        smtp_password: '',
        // Mobile Message Settings
        sender_id: '',
        apikey: '',
        status: 1,
        // Virtual Account Charges (Admin Only)
        va_create_charge: 0,
        va_receive_charge: 0,
        api_vpa_receive_charge: 0,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [existingData, setExistingData] = useState(null);
    const navigate = useNavigate();
    const apiService = ApiService();
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Fetch existing settings on component mount
        fetchSettings();
    }, [id]);

    const fetchSettings = async () => {
        try {
            let endpoint = '/api/settings';
            if (id) {
                endpoint += `?user_id=${id}`;
            }
            const res = await apiService.vGet(endpoint);
            if (res.data && res.data.status === 1 && res.data.setting) {
                setExistingData(res.data.setting);
                setForm(prev => ({
                    ...prev,
                    ...res.data.setting,
                    va_create_charge: res.data.setting.va_create_charge ?? 0,
                    va_receive_charge: res.data.setting.va_receive_charge ?? 0,
                    api_vpa_receive_charge: res.data.setting.api_vpa_receive_charge ?? 0,
                    // Handle file fields separately
                    logo: null,
                    footer_logo: null,
                    favicon: null,
                    playstore_qr_img: null,
                }));
            }
        } catch (err) {
            console.log('No existing settings found or error fetching settings');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setForm({
                ...form,
                [name]: files[0] || null
            });
        } else {
            setForm({
                ...form,
                [name]: name === 'status' ? Number(value) : value
            });
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.company_name) errs.company_name = 'Company Name is required';
        if (!form.email) errs.email = 'Email is required';
        if (!form.mobile_no) errs.mobile_no = 'Mobile Number is required';
        if (!form.currency_code) errs.currency_code = 'Currency Code is required';
        if (form.status === '' || form.status === null || form.status === undefined) errs.status = 'Status is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setSuccess(false);
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            Object.values(errs).forEach(msg => toast.error(msg));
            return;
        }
        setLoading(true);

        try {
            // Separate file uploads from regular data
            const settingsData = {};
            const filesData = {};
            const fileFields = ['logo', 'footer_logo', 'favicon', 'playstore_qr_img'];

            // Include all non-file fields
            Object.keys(form).forEach(key => {
                if (fileFields.includes(key)) {
                    if (form[key] instanceof File) {
                        filesData[key] = form[key];
                    }
                } else if (form[key] !== null && form[key] !== undefined) {
                    settingsData[key] = form[key];
                }
            });

            if (existingData?.id) {
                settingsData['id'] = existingData.id;
            }
            if (id) {
                settingsData['user_id'] = id;
            }

            // Send to backend with files if any file selected
            let res;
            if (Object.keys(filesData).length > 0) {
                res = await apiService.postWithFile('/api/settings', settingsData, filesData);
            } else {
                res = await apiService.vPost('/api/settings', settingsData);
            }

            if (res && res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Settings saved successfully');
                setSuccess(true);
                setTimeout(() => {
                    fetchSettings();
                }, 1000);
            } else {
                if (res.data && res.data.error) {
                    Object.values(res.data.error).flat().forEach(msg => toast.error(msg));
                } else {
                    toast.error(res.data?.message || 'Failed to save settings');
                }
            }
        } catch (err) {
            console.error('Settings save error:', err);
            if (err?.response?.data?.error) {
                Object.values(err.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err?.response?.data?.message || 'Failed to save settings');
            }
        }
        setLoading(false);
    };

    return (
        <>
            <Pageheader mainheading="Settings Master" parentfolder="Settings" activepage="Configuration" />
            <ToastContainer position="top-right" autoClose={5000} />


            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="fa fa-cogs me-2"></i>
                                        <h5 className="mb-0 fw-semibold">System Settings</h5>
                                    </span>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit} className="row">
                                        {/* Company Settings Section */}
                                        <div className="col-12">
                                            <h6 className="text-primary mb-3 border-bottom pb-2">
                                                <i className="fa fa-building me-2"></i>Company Settings
                                            </h6>
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <label>Company Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="company_name"
                                                value={form.company_name}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.company_name && <div className="text-danger">{errors.company_name}</div>}
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <label>Status</label>
                                            <select className="form-select" name="status" value={form.status} onChange={handleChange} required>
                                                <option value={1}>Active</option>
                                                <option value={0}>Not Active</option>
                                            </select>
                                            {errors.status && <div className="text-danger">{errors.status}</div>}
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Logo</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="logo"
                                                onChange={handleChange}
                                                accept="image/*"
                                            />
                                            {existingData?.logo && (
                                                <div className="mt-2">

                                                    <img
                                                        src={existingData.logo}
                                                        alt="Current Logo"
                                                        style={{
                                                            maxWidth: '150px',
                                                            maxHeight: '100px',
                                                            objectFit: 'contain',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            padding: '5px',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Footer Logo</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="footer_logo"
                                                onChange={handleChange}
                                                accept="image/*"
                                            />
                                            {existingData?.footer_logo && (
                                                <div className="mt-2">

                                                    <img
                                                        src={existingData.footer_logo}
                                                        alt="Current Footer Logo"
                                                        style={{
                                                            maxWidth: '150px',
                                                            maxHeight: '100px',
                                                            objectFit: 'contain',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            padding: '5px',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Favicon</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="favicon"
                                                onChange={handleChange}
                                                accept="image/*,.ico"
                                            />
                                            {existingData?.favicon && (
                                                <div className="mt-2">

                                                    <img
                                                        src={existingData.favicon}
                                                        alt="Current Favicon"
                                                        style={{
                                                            maxWidth: '32px',
                                                            maxHeight: '32px',
                                                            objectFit: 'contain',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            padding: '2px',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Play Store App Settings Section */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary mb-3 border-bottom pb-2">
                                                <i className="fa fa-android me-2"></i>Play Store App Settings
                                            </h6>
                                        </div>

                                        <div className="mb-3 col-md-12">
                                            <label>Play Store App URL</label>
                                            <textarea
                                                className="form-control"
                                                name="playstore_url"
                                                value={form.playstore_url || ''}
                                                onChange={handleChange}
                                                rows="3"
                                                placeholder="Enter Play Store App URL"
                                            />
                                        </div>

                                        <div className="mb-3 col-md-12">
                                            <label>Play Store QR Image</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="playstore_qr_img"
                                                onChange={handleChange}
                                                accept="image/*"
                                            />
                                            {existingData?.playstore_qr_img && (
                                                <div className="mt-2">
                                                    <img
                                                        src={existingData.playstore_qr_img}
                                                        alt="Current Play Store QR"
                                                        style={{
                                                            maxWidth: '120px',
                                                            maxHeight: '120px',
                                                            objectFit: 'contain',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            padding: '5px',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Contact Section */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary mb-3 border-bottom pb-2">
                                                <i className="fa fa-address-card me-2"></i>Footer Contact Information
                                            </h6>
                                        </div>

                                        <div className="mb-3 col-md-12">
                                            <label>About</label>
                                            <textarea
                                                className="form-control"
                                                name="about"
                                                value={form.about}
                                                onChange={handleChange}
                                                rows="3"
                                            />
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <label>Copy Right</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="copy_right"
                                                value={form.copy_right}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <label>Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="address"
                                                value={form.address}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.email && <div className="text-danger">{errors.email}</div>}
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <label>Website</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="website"
                                                value={form.website}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <label>Callback URL</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="call_back_url"
                                                value={form.call_back_url}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>WhatsApp Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="whatsapp_no"
                                                value={form.whatsapp_no}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Mobile Number *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="mobile_no"
                                                value={form.mobile_no}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.mobile_no && <div className="text-danger">{errors.mobile_no}</div>}
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Landline Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="landline_no"
                                                value={form.landline_no}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-md-12">
                                            <label>Map URL</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                name="map_url"
                                                value={form.map_url}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Meta Section */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary mb-3 border-bottom pb-2">
                                                <i className="fa fa-tags me-2"></i>Meta Section
                                            </h6>
                                        </div>

                                        <div className="mb-3 col-md-12">
                                            <label>Meta Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="meta_title"
                                                value={form.meta_title}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3 col-md-12">
                                            <label>Meta Keywords</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="meta_keyword"
                                                value={form.meta_keyword}
                                                onChange={handleChange}
                                                placeholder="Separate keywords with commas"
                                            />
                                        </div>

                                        <div className="mb-3 col-md-12">
                                            <label>Meta Description</label>
                                            <textarea
                                                className="form-control"
                                                name="meta_description"
                                                value={form.meta_description}
                                                onChange={handleChange}
                                                rows="3"
                                            />
                                        </div>

                                        {/* Theme/Color Section */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary mb-3 border-bottom pb-2">
                                                <i className="fa fa-palette me-2"></i>Theme & Color Settings
                                            </h6>
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Theme Color Primary</label>
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color me-2"
                                                    name="theme_color_primary"
                                                    value={form.theme_color_primary}
                                                    onChange={handleChange}
                                                    style={{ width: '60px' }}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={form.theme_color_primary}
                                                    onChange={(e) => setForm({ ...form, theme_color_primary: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Theme Color Secondary</label>
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color me-2"
                                                    name="theme_color_secondary"
                                                    value={form.theme_color_secondary}
                                                    onChange={handleChange}
                                                    style={{ width: '60px' }}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={form.theme_color_secondary}
                                                    onChange={(e) => setForm({ ...form, theme_color_secondary: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Currency Code *</label>
                                            <select className="form-control" name="currency_code" value={form.currency_code} onChange={handleChange} required>
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="GBP">GBP - British Pound</option>
                                                <option value="INR">INR - Indian Rupee</option>
                                                <option value="JPY">JPY - Japanese Yen</option>
                                                <option value="CAD">CAD - Canadian Dollar</option>
                                                <option value="AUD">AUD - Australian Dollar</option>
                                                <option value="CHF">CHF - Swiss Franc</option>
                                                <option value="CNY">CNY - Chinese Yuan</option>
                                                <option value="SEK">SEK - Swedish Krona</option>
                                            </select>
                                            {errors.currency_code && <div className="text-danger">{errors.currency_code}</div>}
                                        </div>



                                        {/* Message Settings - Category Wise Cards */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary mb-3 border-bottom pb-2">
                                                <i className="fa fa-envelope me-2"></i>Message Settings
                                            </h6>
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h6 className="card-title">Mail Message Setting</h6>
                                                    <div className="mb-2">
                                                        <label>SMTP User</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="smtp_user"
                                                            value={form.smtp_user}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label>SMTP Host</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="smtp_host"
                                                            value={form.smtp_host}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label>SMTP Port</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="smtp_port"
                                                            value={form.smtp_port}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label>SMTP Password</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="smtp_password"
                                                            value={form.smtp_password}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3 col-md-6">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h6 className="card-title">Mobile Message Setting</h6>
                                                    <div className="mb-2">
                                                        <label>Sender ID</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="sender_id"
                                                            value={form.sender_id}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label>API Key</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="apikey"
                                                            value={form.apikey}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Virtual Account Charges (Admin Only) */}
                                        {isAdmin && (
                                            <>
                                                <div className="col-12 mt-4">
                                                    <h6 className="text-primary mb-3 border-bottom pb-2">
                                                        <i className="fa fa-credit-card me-2"></i>Virtual Account Charges
                                                    </h6>
                                                </div>

                                                <div className="mb-3 col-md-4">
                                                    <label className="fw-semibold">VA Create Charge</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control"
                                                        name="va_create_charge"
                                                        value={form.va_create_charge ?? 0}
                                                        onChange={handleChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <div className="mb-3 col-md-4">
                                                    <label className="fw-semibold">Merchant VA Credit Charge</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control"
                                                        name="va_receive_charge"
                                                        value={form.va_receive_charge ?? 0}
                                                        onChange={handleChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <div className="mb-3 col-md-4">
                                                    <label className="fw-semibold">Admin VA Credit Charge</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control"
                                                        name="api_vpa_receive_charge"
                                                        value={form.api_vpa_receive_charge ?? 0}
                                                        onChange={handleChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="col-12 mt-4">
                                            <button type="submit" className="btn btn-primary w-100 text-white" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <i className="fa fa-spinner fa-spin me-2"></i>
                                                        {existingData ? 'Updating...' : 'Saving...'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-save me-2"></i>
                                                        {existingData ? 'Update Settings' : 'Save Settings'}
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {success && (
                                            <div className="col-12 mt-3">
                                                <div className="alert alert-success">
                                                    <i className="fa fa-check-circle me-2"></i>
                                                    Settings saved successfully!
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingIndex;
